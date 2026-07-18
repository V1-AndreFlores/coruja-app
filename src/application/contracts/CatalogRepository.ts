import type { CatalogItemSummary, MediaType } from '@/domain/models/CatalogItemSummary';
import type { TitleDetails } from '@/domain/models/TitleDetails';
import type {
  CatalogSearchResponse,
  SearchFilters,
  WatchProviderOption,
} from '@/domain/models/SearchFilters';

export interface CatalogRepository {
  getTrending(signal?: AbortSignal): Promise<CatalogItemSummary[]>;
  getPopularMovies(signal?: AbortSignal): Promise<CatalogItemSummary[]>;
  getPopularTv(signal?: AbortSignal): Promise<CatalogItemSummary[]>;
  search(
    query: string,
    filters: SearchFilters,
    signal?: AbortSignal,
  ): Promise<CatalogSearchResponse>;
  discover(
    filters: SearchFilters,
    signal?: AbortSignal,
  ): Promise<CatalogSearchResponse>;
  getWatchProviderOptions(signal?: AbortSignal): Promise<WatchProviderOption[]>;
  getTitleDetails(
    mediaType: MediaType,
    id: number,
    signal?: AbortSignal,
  ): Promise<TitleDetails>;
}
