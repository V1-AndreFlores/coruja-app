import type { CatalogItemSummary, MediaType } from '@/domain/models/CatalogItemSummary';
import type { TitleDetails } from '@/domain/models/TitleDetails';

export interface CatalogRepository {
  getTrending(signal?: AbortSignal): Promise<CatalogItemSummary[]>;
  getPopularMovies(signal?: AbortSignal): Promise<CatalogItemSummary[]>;
  getPopularTv(signal?: AbortSignal): Promise<CatalogItemSummary[]>;
  search(query: string, signal?: AbortSignal): Promise<CatalogItemSummary[]>;
  getTitleDetails(
    mediaType: MediaType,
    id: number,
    signal?: AbortSignal,
  ): Promise<TitleDetails>;
}
