import type { CatalogRepository } from '@/application/contracts/CatalogRepository';
import type {
  CatalogItemSummary,
  MediaType,
} from '@/domain/models/CatalogItemSummary';
import type { TitleDetails } from '@/domain/models/TitleDetails';
import { MemoryCache } from '@/infrastructure/cache/MemoryCache';
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
  TmdbWatchProvidersDto,
} from './TmdbDtos';
import {
  mapMovieDetails,
  mapTmdbCatalogItem,
  mapTmdbPersonCredits,
  mapTvDetails,
} from './TmdbMappers';

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
    signal?: AbortSignal,
  ): Promise<CatalogItemSummary[]> {
    const normalizedQuery = query.trim();
    const cacheKey = `search:${normalizedQuery.toLocaleLowerCase('pt-BR')}`;
    const cached = this.cache.get<CatalogItemSummary[]>(cacheKey);

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
      ),
      this.client.get<TmdbPagedResponse<TmdbPersonSearchResultDto>>(
        '/search/person',
        searchParams,
        signal,
      ),
    ]);

    const directTitleResults = titleResponse.results
      .filter((item) => item.adult !== true)
      .map((item) => mapTmdbCatalogItem(item))
      .filter((item): item is CatalogItemSummary => item !== null);

    const mostRelevantPerson = personResponse.results[0];
    const personTitleResults = mostRelevantPerson
      ? await this.getPersonCredits(mostRelevantPerson.id, signal)
      : [];

    const mergedResults = this.mergeUniqueCatalogItems(
      directTitleResults,
      personTitleResults,
    );

    this.cache.set(cacheKey, mergedResults, TMDB.searchCacheTtlMs);
    return mergedResults;
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
      ),
      this.client.get<TmdbVideosDto>(`/movie/${id}/videos`, {}, signal),
      this.client.get<TmdbWatchProvidersDto>(
        `/movie/${id}/watch/providers`,
        {},
        signal,
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
      ),
      this.client.get<TmdbCreditsDto>(
        `/tv/${id}/aggregate_credits`,
        { language: TMDB.language },
        signal,
      ),
      this.client.get<TmdbVideosDto>(`/tv/${id}/videos`, {}, signal),
      this.client.get<TmdbWatchProvidersDto>(
        `/tv/${id}/watch/providers`,
        {},
        signal,
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
    >(path, params, signal);

    const items = response.results
      .filter((item) => item.adult !== true)
      .map((item) => mapTmdbCatalogItem(item, fallbackMediaType))
      .filter((item): item is CatalogItemSummary => item !== null);

    this.cache.set(cacheKey, items, ttlMs);
    return items;
  }
}
