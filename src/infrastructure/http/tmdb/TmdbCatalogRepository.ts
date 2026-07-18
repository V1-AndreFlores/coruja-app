import type { CatalogRepository } from '@/application/contracts/CatalogRepository';
import type {
  CatalogItemSummary,
  MediaType,
} from '@/domain/models/CatalogItemSummary';
import type {
  CatalogSearchResponse,
  SearchFilters,
  WatchProviderOption,
} from '@/domain/models/SearchFilters';
import type { TitleDetails } from '@/domain/models/TitleDetails';
import { MemoryCache } from '@/infrastructure/cache/MemoryCache';
import { getGenreIdsForMediaType } from '@/shared/constants/searchFilters';
import { TMDB } from '@/shared/constants/tmdb';

import { TmdbClient } from './TmdbClient';
import type {
  TmdbCatalogItemDto,
  TmdbCombinedCreditsDto,
  TmdbCreditsDto,
  TmdbMovieDetailsDto,
  TmdbPagedResponse,
  TmdbPersonSearchResultDto,
  TmdbTvDetailsDto,
  TmdbVideosDto,
  TmdbWatchProviderDto,
  TmdbWatchProviderListDto,
  TmdbWatchProvidersDto,
} from './TmdbDtos';
import {
  mapMovieDetails,
  mapTmdbCatalogItem,
  mapTmdbPersonCredits,
  mapTvDetails,
} from './TmdbMappers';

type PreferredProvider = {
  key: string;
  name: string;
  aliases: string[];
};


const CATALOG_REQUEST_OPTIONS = {
  timeoutMs: TMDB.catalogRequestTimeoutMs,
  retryCount: TMDB.catalogRequestRetryCount,
  retryDelayMs: TMDB.catalogRequestRetryDelayMs,
} as const;

const DETAILS_REQUEST_OPTIONS = {
  timeoutMs: TMDB.detailsRequestTimeoutMs,
  retryCount: TMDB.detailsRequestRetryCount,
  retryDelayMs: TMDB.detailsRequestRetryDelayMs,
} as const;

const PREFERRED_PROVIDERS: PreferredProvider[] = [
  { key: 'netflix', name: 'Netflix', aliases: ['Netflix'] },
  {
    key: 'prime-video',
    name: 'Prime Video',
    aliases: ['Amazon Prime Video', 'Prime Video'],
  },
  { key: 'disney-plus', name: 'Disney+', aliases: ['Disney Plus'] },
  { key: 'max', name: 'Max', aliases: ['Max', 'HBO Max'] },
  { key: 'globoplay', name: 'Globoplay', aliases: ['Globoplay'] },
  {
    key: 'apple-tv-plus',
    name: 'Apple TV+',
    aliases: ['Apple TV Plus'],
  },
  {
    key: 'paramount-plus',
    name: 'Paramount+',
    aliases: ['Paramount Plus'],
  },
  { key: 'mubi', name: 'MUBI', aliases: ['MUBI'] },
];

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isLikelyPersonMatch(
  query: string,
  person?: TmdbPersonSearchResultDto,
): person is TmdbPersonSearchResultDto {
  if (!person) {
    return false;
  }

  const normalizedQuery = normalizeText(query);
  const normalizedName = normalizeText(person.name);

  if (normalizedQuery.length < 3) {
    return false;
  }

  if (normalizedQuery === normalizedName) {
    return true;
  }

  const queryTokens = normalizedQuery.split(' ');
  const nameTokens = normalizedName.split(' ');

  return queryTokens.every((queryToken) =>
    nameTokens.some(
      (nameToken) =>
        nameToken === queryToken ||
        nameToken.startsWith(queryToken) ||
        queryToken.startsWith(nameToken),
    ),
  );
}

function findProviderByAliases(
  providers: TmdbWatchProviderDto[],
  aliases: string[],
): TmdbWatchProviderDto | undefined {
  const normalizedAliases = aliases.map(normalizeText);

  return providers.find((provider) =>
    normalizedAliases.includes(normalizeText(provider.provider_name)),
  );
}

export class TmdbCatalogRepository implements CatalogRepository {
  constructor(
    private readonly client: TmdbClient,
    private readonly cache: MemoryCache,
  ) {}

  getTrending(signal?: AbortSignal): Promise<CatalogItemSummary[]> {
    return this.getCatalogPage(
      'trending:all:day',
      '/trending/all/day',
      { language: TMDB.language },
      undefined,
      TMDB.catalogCacheTtlMs,
      signal,
    );
  }

  getPopularMovies(signal?: AbortSignal): Promise<CatalogItemSummary[]> {
    return this.getCatalogPage(
      'popular:movie:br',
      '/movie/popular',
      { language: TMDB.language, region: TMDB.region, page: 1 },
      'movie',
      TMDB.catalogCacheTtlMs,
      signal,
    );
  }

  getPopularTv(signal?: AbortSignal): Promise<CatalogItemSummary[]> {
    return this.getCatalogPage(
      'popular:tv',
      '/tv/popular',
      { language: TMDB.language, page: 1 },
      'tv',
      TMDB.catalogCacheTtlMs,
      signal,
    );
  }

  async search(
    query: string,
    filters: SearchFilters,
    signal?: AbortSignal,
  ): Promise<CatalogSearchResponse> {
    const normalizedQuery = query.trim();
    const cacheKey = `search:${normalizeText(normalizedQuery)}:${JSON.stringify(filters)}`;
    const cached = this.cache.get<CatalogSearchResponse>(cacheKey);

    if (cached) {
      return cached;
    }

    const searchParams = {
      query: normalizedQuery,
      include_adult: false,
      language: TMDB.language,
      page: 1,
    };

    const [titleResponse, personResponse] = await Promise.all([
      this.client.get<TmdbPagedResponse<TmdbCatalogItemDto>>(
        '/search/multi',
        searchParams,
        signal,
        CATALOG_REQUEST_OPTIONS,
      ),
      this.client.get<TmdbPagedResponse<TmdbPersonSearchResultDto>>(
        '/search/person',
        searchParams,
        signal,
        CATALOG_REQUEST_OPTIONS,
      ),
    ]);

    const directTitleResults = titleResponse.results
      .filter((item) => item.adult !== true)
      .map((item) => mapTmdbCatalogItem(item))
      .filter((item): item is CatalogItemSummary => item !== null);

    const mostRelevantPerson = personResponse.results[0];
    const matchedPerson = isLikelyPersonMatch(
      normalizedQuery,
      mostRelevantPerson,
    )
      ? mostRelevantPerson
      : undefined;

    const personTitleResults = matchedPerson
      ? await this.getPersonCredits(matchedPerson.id, signal)
      : [];

    let filteredDirectResults = this.applyLocalFilters(
      directTitleResults,
      filters,
    );
    const filteredPersonResults = this.applyLocalFilters(
      personTitleResults,
      filters,
    );

    if (filters.providerKey && !matchedPerson) {
      filteredDirectResults = await this.filterByWatchProvider(
        filteredDirectResults,
        filters,
        signal,
      );
    }

    const response: CatalogSearchResponse = {
      items: this.mergeUniqueCatalogItems(
        filteredDirectResults,
        filteredPersonResults,
      ),
      matchedPersonName: matchedPerson?.name,
    };

    this.cache.set(cacheKey, response, TMDB.searchCacheTtlMs);
    return response;
  }

  async getWatchProviderOptions(
    signal?: AbortSignal,
  ): Promise<WatchProviderOption[]> {
    const cacheKey = `watch-provider-options:${TMDB.region}`;
    const cached = this.cache.get<WatchProviderOption[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const params = {
      language: TMDB.language,
      watch_region: TMDB.region,
    };

    const [movieResponse, tvResponse] = await Promise.all([
      this.client.get<TmdbWatchProviderListDto>(
        '/watch/providers/movie',
        params,
        signal,
        CATALOG_REQUEST_OPTIONS,
      ),
      this.client.get<TmdbWatchProviderListDto>(
        '/watch/providers/tv',
        params,
        signal,
        CATALOG_REQUEST_OPTIONS,
      ),
    ]);

    const options = PREFERRED_PROVIDERS.map((preferred) => {
      const movieProvider = findProviderByAliases(
        movieResponse.results,
        preferred.aliases,
      );
      const tvProvider = findProviderByAliases(
        tvResponse.results,
        preferred.aliases,
      );

      return {
        key: preferred.key,
        name: preferred.name,
        movieProviderId: movieProvider?.provider_id,
        tvProviderId: tvProvider?.provider_id,
      } satisfies WatchProviderOption;
    }).filter(
      (provider) => provider.movieProviderId || provider.tvProviderId,
    );

    this.cache.set(cacheKey, options, TMDB.catalogCacheTtlMs);
    return options;
  }

  async getTitleDetails(
    mediaType: MediaType,
    id: number,
    signal?: AbortSignal,
  ): Promise<TitleDetails> {
    const cacheKey = `details:${mediaType}:${id}`;
    const cached = this.cache.get<TitleDetails>(cacheKey);

    if (cached) {
      return cached;
    }

    const details =
      mediaType === 'movie'
        ? await this.getMovieDetails(id, signal)
        : await this.getTvDetails(id, signal);

    this.cache.set(cacheKey, details, TMDB.detailsCacheTtlMs);
    return details;
  }

  private applyLocalFilters(
    items: CatalogItemSummary[],
    filters: SearchFilters,
  ): CatalogItemSummary[] {
    return items.filter((item) => {
      if (
        filters.mediaType !== 'all' &&
        item.mediaType !== filters.mediaType
      ) {
        return false;
      }

      if (filters.genre) {
        const acceptedGenreIds = getGenreIdsForMediaType(
          filters.genre,
          item.mediaType,
        );

        if (
          acceptedGenreIds.length === 0 ||
          !item.genreIds?.some((genreId) =>
            acceptedGenreIds.includes(genreId),
          )
        ) {
          return false;
        }
      }

      if (
        filters.yearFrom &&
        (!item.releaseYear || item.releaseYear < filters.yearFrom)
      ) {
        return false;
      }

      if (
        filters.yearTo &&
        (!item.releaseYear || item.releaseYear > filters.yearTo)
      ) {
        return false;
      }

      if (
        filters.minimumRating &&
        (!item.voteAverage || item.voteAverage < filters.minimumRating)
      ) {
        return false;
      }

      return true;
    });
  }

  private async filterByWatchProvider(
    items: CatalogItemSummary[],
    filters: SearchFilters,
    signal?: AbortSignal,
  ): Promise<CatalogItemSummary[]> {
    if (!filters.providerKey) {
      return items;
    }

    const providers = await this.getWatchProviderOptions(signal);
    const selectedProvider = providers.find(
      (provider) => provider.key === filters.providerKey,
    );

    if (!selectedProvider) {
      return [];
    }

    const matches = await Promise.all(
      items.map(async (item) => {
        const providerId =
          item.mediaType === 'movie'
            ? selectedProvider.movieProviderId
            : selectedProvider.tvProviderId;

        if (!providerId) {
          return false;
        }

        const watchProviders = await this.getWatchProviders(
          item.mediaType,
          item.id,
          signal,
        );
        const brazil = watchProviders.results[TMDB.region];

        if (!brazil) {
          return false;
        }

        const groups =
          filters.availability === 'any'
            ? [brazil.flatrate, brazil.rent, brazil.buy]
            : [brazil[filters.availability]];

        return groups.some((group) =>
          group?.some((provider) => provider.provider_id === providerId),
        );
      }),
    );

    return items.filter((_, index) => matches[index]);
  }

  private async getWatchProviders(
    mediaType: MediaType,
    id: number,
    signal?: AbortSignal,
  ): Promise<TmdbWatchProvidersDto> {
    const cacheKey = `watch-providers:${mediaType}:${id}`;
    const cached = this.cache.get<TmdbWatchProvidersDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await this.client.get<TmdbWatchProvidersDto>(
      `/${mediaType}/${id}/watch/providers`,
      {},
      signal,
      CATALOG_REQUEST_OPTIONS,
    );

    this.cache.set(cacheKey, response, TMDB.detailsCacheTtlMs);
    return response;
  }

  private async getMovieDetails(
    id: number,
    signal?: AbortSignal,
  ): Promise<TitleDetails> {
    const [details, videos, providers] = await Promise.all([
      this.client.get<TmdbMovieDetailsDto>(
        `/movie/${id}`,
        {
          language: TMDB.language,
          append_to_response: 'credits,release_dates',
        },
        signal,
        DETAILS_REQUEST_OPTIONS,
      ),
      this.client.get<TmdbVideosDto>(
        `/movie/${id}/videos`,
        {},
        signal,
        DETAILS_REQUEST_OPTIONS,
      ),
      this.client.get<TmdbWatchProvidersDto>(
        `/movie/${id}/watch/providers`,
        {},
        signal,
        DETAILS_REQUEST_OPTIONS,
      ),
    ]);

    details.videos = videos;
    return mapMovieDetails(details, providers);
  }

  private async getTvDetails(
    id: number,
    signal?: AbortSignal,
  ): Promise<TitleDetails> {
    const [details, aggregateCredits, videos, providers] = await Promise.all([
      this.client.get<TmdbTvDetailsDto>(
        `/tv/${id}`,
        {
          language: TMDB.language,
          append_to_response: 'content_ratings',
        },
        signal,
        DETAILS_REQUEST_OPTIONS,
      ),
      this.client.get<TmdbCreditsDto>(
        `/tv/${id}/aggregate_credits`,
        { language: TMDB.language },
        signal,
        DETAILS_REQUEST_OPTIONS,
      ),
      this.client.get<TmdbVideosDto>(
        `/tv/${id}/videos`,
        {},
        signal,
        DETAILS_REQUEST_OPTIONS,
      ),
      this.client.get<TmdbWatchProvidersDto>(
        `/tv/${id}/watch/providers`,
        {},
        signal,
        DETAILS_REQUEST_OPTIONS,
      ),
    ]);

    details.videos = videos;
    return mapTvDetails(details, aggregateCredits, providers);
  }

  private async getPersonCredits(
    personId: number,
    signal?: AbortSignal,
  ): Promise<CatalogItemSummary[]> {
    const response = await this.client.get<TmdbCombinedCreditsDto>(
      `/person/${personId}/combined_credits`,
      { language: TMDB.language },
      signal,
      CATALOG_REQUEST_OPTIONS,
    );

    return mapTmdbPersonCredits(response, TMDB.personCreditsLimit);
  }

  private mergeUniqueCatalogItems(
    directTitleResults: CatalogItemSummary[],
    personTitleResults: CatalogItemSummary[],
  ): CatalogItemSummary[] {
    const uniqueItems = new Map<string, CatalogItemSummary>();

    [...directTitleResults, ...personTitleResults].forEach((item) => {
      const key = `${item.mediaType}:${item.id}`;

      if (!uniqueItems.has(key)) {
        uniqueItems.set(key, item);
      }
    });

    return [...uniqueItems.values()];
  }

  private async getCatalogPage(
    cacheKey: string,
    path: string,
    params: Record<string, string | number | boolean>,
    fallbackMediaType: MediaType | undefined,
    ttlMs: number,
    signal?: AbortSignal,
  ): Promise<CatalogItemSummary[]> {
    const cached = this.cache.get<CatalogItemSummary[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await this.client.get<
      TmdbPagedResponse<TmdbCatalogItemDto>
    >(path, params, signal, CATALOG_REQUEST_OPTIONS);

    const items = response.results
      .filter((item) => item.adult !== true)
      .map((item) => mapTmdbCatalogItem(item, fallbackMediaType))
      .filter((item): item is CatalogItemSummary => item !== null);

    this.cache.set(cacheKey, items, ttlMs);
    return items;
  }
}
