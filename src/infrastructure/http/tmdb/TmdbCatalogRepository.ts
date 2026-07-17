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
  TmdbCreditsDto,
  TmdbMovieDetailsDto,
  TmdbPagedResponse,
  TmdbTvDetailsDto,
  TmdbVideosDto,
  TmdbWatchProvidersDto,
} from './TmdbDtos';
import {
  mapMovieDetails,
  mapTmdbCatalogItem,
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

  search(
    query: string,
    signal?: AbortSignal,
  ): Promise<CatalogItemSummary[]> {
    const normalizedQuery = query.trim();

    return this.getCatalogPage(
      `search:${normalizedQuery.toLocaleLowerCase('pt-BR')}`,
      '/search/multi',
      {
        query: normalizedQuery,
        include_adult: false,
        language: TMDB.language,
        page: 1,
      },
      undefined,
      TMDB.searchCacheTtlMs,
      signal,
    );
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
