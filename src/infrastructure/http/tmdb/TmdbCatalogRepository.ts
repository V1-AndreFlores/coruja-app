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

type CanonicalProvider = {
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

const CANONICAL_PROVIDERS: CanonicalProvider[] = [
  { key: 'netflix', name: 'Netflix', aliases: ['Netflix'] },
  {
    key: 'prime-video',
    name: 'Prime Video',
    aliases: ['Amazon Prime Video', 'Prime Video'],
  },
  { key: 'disney-plus', name: 'Disney+', aliases: ['Disney Plus'] },
  { key: 'max', name: 'Max', aliases: ['Max', 'HBO Max'] },
  { key: 'apple-tv-plus', name: 'Apple TV+', aliases: ['Apple TV Plus'] },
  { key: 'globoplay', name: 'Globoplay', aliases: ['Globoplay'] },
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

function findCanonicalProvider(
  providerName: string,
): CanonicalProvider | undefined {
  const normalizedName = normalizeText(providerName);

  return CANONICAL_PROVIDERS.find((provider) =>
    provider.aliases.some((alias) => normalizeText(alias) === normalizedName),
  );
}

function createProviderKey(providerName: string): string {
  return (
    findCanonicalProvider(providerName)?.key ??
    normalizeText(providerName).replace(/\s+/g, '-')
  );
}

function createProviderName(providerName: string): string {
  return findCanonicalProvider(providerName)?.name ?? providerName.trim();
}

function getPreferredProviderIndex(providerKey: string): number {
  const index = CANONICAL_PROVIDERS.findIndex(
    (provider) => provider.key === providerKey,
  );

  return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

function interleaveCatalogItems(
  movies: CatalogItemSummary[],
  tvShows: CatalogItemSummary[],
  limit = 40,
): CatalogItemSummary[] {
  const items: CatalogItemSummary[] = [];
  const maxLength = Math.max(movies.length, tvShows.length);

  for (let index = 0; index < maxLength && items.length < limit; index += 1) {
    const movie = movies[index];
    const tvShow = tvShows[index];

    if (movie) {
      items.push(movie);
    }

    if (tvShow && items.length < limit) {
      items.push(tvShow);
    }
  }

  return items;
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

    if (filters.providerKeys.length > 0 && !matchedPerson) {
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

  async discover(
    filters: SearchFilters,
    signal?: AbortSignal,
  ): Promise<CatalogSearchResponse> {
    const cacheKey = `discover:${JSON.stringify(filters)}`;
    const cached = this.cache.get<CatalogSearchResponse>(cacheKey);

    if (cached) {
      return cached;
    }

    const providers =
      filters.providerKeys.length > 0
        ? await this.getWatchProviderOptions(signal)
        : [];

    const requests: Array<Promise<CatalogItemSummary[]>> = [];

    if (filters.mediaType === 'all' || filters.mediaType === 'movie') {
      requests.push(this.discoverMediaType('movie', filters, providers, signal));
    }

    if (filters.mediaType === 'all' || filters.mediaType === 'tv') {
      requests.push(this.discoverMediaType('tv', filters, providers, signal));
    }

    const results = await Promise.all(requests);
    const items =
      filters.mediaType === 'all'
        ? interleaveCatalogItems(results[0] ?? [], results[1] ?? [])
        : results[0] ?? [];

    const response: CatalogSearchResponse = { items };
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

    const providerMap = new Map<string, WatchProviderOption>();

    const mergeProvider = (
      provider: TmdbWatchProviderDto,
      mediaType: MediaType,
    ) => {
      const key = createProviderKey(provider.provider_name);
      const current = providerMap.get(key);
      const next: WatchProviderOption = {
        key,
        name: createProviderName(provider.provider_name),
        logoPath: current?.logoPath ?? provider.logo_path ?? null,
        displayPriority: Math.min(
          current?.displayPriority ?? Number.MAX_SAFE_INTEGER,
          provider.display_priority ?? Number.MAX_SAFE_INTEGER,
        ),
        movieProviderId:
          mediaType === 'movie' ? provider.provider_id : current?.movieProviderId,
        tvProviderId:
          mediaType === 'tv' ? provider.provider_id : current?.tvProviderId,
      };

      providerMap.set(key, next);
    };

    movieResponse.results.forEach((provider) => mergeProvider(provider, 'movie'));
    tvResponse.results.forEach((provider) => mergeProvider(provider, 'tv'));

    const options = [...providerMap.values()].sort((left, right) => {
      const preferredDifference =
        getPreferredProviderIndex(left.key) - getPreferredProviderIndex(right.key);

      if (preferredDifference !== 0) {
        return preferredDifference;
      }

      const priorityDifference = left.displayPriority - right.displayPriority;
      return priorityDifference !== 0
        ? priorityDifference
        : left.name.localeCompare(right.name, 'pt-BR');
    });

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

  private async discoverMediaType(
    mediaType: MediaType,
    filters: SearchFilters,
    providers: WatchProviderOption[],
    signal?: AbortSignal,
  ): Promise<CatalogItemSummary[]> {
    const params: Record<string, string | number | boolean> = {
      include_adult: false,
      language: TMDB.language,
      page: 1,
      sort_by: 'popularity.desc',
    };

    if (filters.genre) {
      const genreIds = getGenreIdsForMediaType(filters.genre, mediaType);
      if (genreIds.length === 0) {
        return [];
      }
      params.with_genres = genreIds.join('|');
    }

    if (filters.yearFrom) {
      params[
        mediaType === 'movie'
          ? 'primary_release_date.gte'
          : 'first_air_date.gte'
      ] = `${filters.yearFrom}-01-01`;
    }

    if (filters.yearTo) {
      params[
        mediaType === 'movie'
          ? 'primary_release_date.lte'
          : 'first_air_date.lte'
      ] = `${filters.yearTo}-12-31`;
    }

    if (filters.minimumRating) {
      params['vote_average.gte'] = filters.minimumRating;
      params['vote_count.gte'] = 20;
    }

    if (filters.providerKeys.length > 0) {
      const providerIds = providers
        .filter((provider) => filters.providerKeys.includes(provider.key))
        .map((provider) =>
          mediaType === 'movie'
            ? provider.movieProviderId
            : provider.tvProviderId,
        )
        .filter((providerId): providerId is number => Boolean(providerId));

      if (providerIds.length === 0) {
        return [];
      }

      params.watch_region = TMDB.region;
      params.with_watch_providers = [...new Set(providerIds)].join('|');

      if (filters.availability !== 'any') {
        params.with_watch_monetization_types = filters.availability;
      }
    }

    return this.getCatalogPage(
      `discover:${mediaType}:${JSON.stringify(filters)}`,
      `/discover/${mediaType}`,
      params,
      mediaType,
      TMDB.searchCacheTtlMs,
      signal,
    );
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
    if (filters.providerKeys.length === 0) {
      return items;
    }

    const providers = await this.getWatchProviderOptions(signal);
    const selectedProviders = providers.filter((provider) =>
      filters.providerKeys.includes(provider.key),
    );

    if (selectedProviders.length === 0) {
      return [];
    }

    const matches = await Promise.all(
      items.map(async (item) => {
        const selectedProviderIds = selectedProviders
          .map((provider) =>
            item.mediaType === 'movie'
              ? provider.movieProviderId
              : provider.tvProviderId,
          )
          .filter((providerId): providerId is number => Boolean(providerId));

        if (selectedProviderIds.length === 0) {
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
          group?.some((provider) =>
            selectedProviderIds.includes(provider.provider_id),
          ),
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
