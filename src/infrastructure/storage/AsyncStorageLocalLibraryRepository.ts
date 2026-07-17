import type { LocalLibraryRepository } from '@/application/contracts/LocalLibraryRepository';
import type {
  CatalogItemSummary,
  HistoryEntry,
} from '@/domain/models/CatalogItemSummary';
import { STORAGE_KEYS } from '@/shared/constants/storage';

import { AsyncStorageJsonStore } from './AsyncStorageJsonStore';

const HISTORY_LIMIT = 100;

function itemKey(item: CatalogItemSummary): string {
  return `${item.mediaType}:${item.id}`;
}

function updateSelection(
  currentItems: CatalogItemSummary[],
  item: CatalogItemSummary,
  selected: boolean,
): CatalogItemSummary[] {
  const nextItems = currentItems.filter(
    (currentItem) => itemKey(currentItem) !== itemKey(item),
  );

  return selected ? [item, ...nextItems] : nextItems;
}

export class AsyncStorageLocalLibraryRepository
  implements LocalLibraryRepository
{
  constructor(private readonly store: AsyncStorageJsonStore) {}

  getFavorites(): Promise<CatalogItemSummary[]> {
    return this.store.read<CatalogItemSummary[]>(STORAGE_KEYS.favorites, []);
  }

  async setFavorite(
    item: CatalogItemSummary,
    selected: boolean,
  ): Promise<void> {
    const currentItems = await this.getFavorites();
    await this.store.write(
      STORAGE_KEYS.favorites,
      updateSelection(currentItems, item, selected),
    );
  }

  getWatchlist(): Promise<CatalogItemSummary[]> {
    return this.store.read<CatalogItemSummary[]>(STORAGE_KEYS.watchlist, []);
  }

  async setWatchlistItem(
    item: CatalogItemSummary,
    selected: boolean,
  ): Promise<void> {
    const currentItems = await this.getWatchlist();
    await this.store.write(
      STORAGE_KEYS.watchlist,
      updateSelection(currentItems, item, selected),
    );
  }

  getHistory(): Promise<HistoryEntry[]> {
    return this.store.read<HistoryEntry[]>(STORAGE_KEYS.history, []);
  }

  async addHistoryEntry(item: CatalogItemSummary): Promise<void> {
    const currentHistory = await this.getHistory();
    const entry: HistoryEntry = {
      ...item,
      viewedAt: new Date().toISOString(),
    };
    const nextHistory = [
      entry,
      ...currentHistory.filter(
        (currentItem) => itemKey(currentItem) !== itemKey(item),
      ),
    ].slice(0, HISTORY_LIMIT);

    await this.store.write(STORAGE_KEYS.history, nextHistory);
  }

  async removeHistoryEntry(item: CatalogItemSummary): Promise<void> {
    const currentHistory = await this.getHistory();
    const key = itemKey(item);
    const nextHistory = currentHistory.filter(
      (currentItem) => itemKey(currentItem) !== key,
    );

    await this.store.write(STORAGE_KEYS.history, nextHistory);
  }

  clearHistory(): Promise<void> {
    return this.store.remove(STORAGE_KEYS.history);
  }
}
