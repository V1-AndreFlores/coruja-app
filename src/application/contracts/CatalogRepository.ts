import type { CatalogItemSummary } from '@/domain/models/CatalogItemSummary';

export interface CatalogRepository {
  getTrending(signal?: AbortSignal): Promise<CatalogItemSummary[]>;
  getPopularMovies(signal?: AbortSignal): Promise<CatalogItemSummary[]>;
  getPopularTv(signal?: AbortSignal): Promise<CatalogItemSummary[]>;
  search(query: string, signal?: AbortSignal): Promise<CatalogItemSummary[]>;
}
