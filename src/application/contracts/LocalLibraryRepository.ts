import type {
  CatalogItemSummary,
  HistoryEntry,
} from '@/domain/models/CatalogItemSummary';

export interface LocalLibraryRepository {
  getFavorites(): Promise<CatalogItemSummary[]>;
  setFavorite(item: CatalogItemSummary, selected: boolean): Promise<void>;
  getWatchlist(): Promise<CatalogItemSummary[]>;
  setWatchlistItem(item: CatalogItemSummary, selected: boolean): Promise<void>;
  getHistory(): Promise<HistoryEntry[]>;
  addHistoryEntry(item: CatalogItemSummary): Promise<void>;
  removeHistoryEntry(item: CatalogItemSummary): Promise<void>;
  clearHistory(): Promise<void>;
}
