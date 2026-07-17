import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import type { CatalogItemSummary } from '@/domain/models/CatalogItemSummary';
import { localLibraryRepository } from '@/infrastructure/storage/repositories';

type LocalLibraryKind = 'favorites' | 'watchlist';
type LocalLibraryStatus = 'loading' | 'success' | 'error';

function itemKey(item: CatalogItemSummary): string {
  return `${item.mediaType}:${item.id}`;
}

async function loadItems(kind: LocalLibraryKind): Promise<CatalogItemSummary[]> {
  return kind === 'favorites'
    ? localLibraryRepository.getFavorites()
    : localLibraryRepository.getWatchlist();
}

async function removeStoredItem(
  kind: LocalLibraryKind,
  item: CatalogItemSummary,
): Promise<void> {
  if (kind === 'favorites') {
    await localLibraryRepository.setFavorite(item, false);
    return;
  }

  await localLibraryRepository.setWatchlistItem(item, false);
}

export function useLocalLibraryList(kind: LocalLibraryKind) {
  const [items, setItems] = useState<CatalogItemSummary[]>([]);
  const [status, setStatus] = useState<LocalLibraryStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [operationError, setOperationError] = useState<string>();
  const [removingKey, setRemovingKey] = useState<string>();
  const [reloadKey, setReloadKey] = useState(0);
  const hasLoadedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      if (!hasLoadedRef.current) {
        setStatus('loading');
      }

      setErrorMessage(undefined);
      setOperationError(undefined);

      void loadItems(kind)
        .then((storedItems) => {
          if (!isActive) {
            return;
          }

          setItems(storedItems);
          setStatus('success');
          hasLoadedRef.current = true;
        })
        .catch(() => {
          if (!isActive) {
            return;
          }

          if (!hasLoadedRef.current) {
            setStatus('error');
          }

          setErrorMessage('Não foi possível carregar os títulos salvos neste aparelho.');
        });

      return () => {
        isActive = false;
      };
    }, [kind, reloadKey]),
  );

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const removeItem = useCallback(
    async (item: CatalogItemSummary) => {
      const key = itemKey(item);

      if (removingKey) {
        return false;
      }

      setRemovingKey(key);
      setOperationError(undefined);

      try {
        await removeStoredItem(kind, item);
        setItems((currentItems) =>
          currentItems.filter((currentItem) => itemKey(currentItem) !== key),
        );
        return true;
      } catch {
        setOperationError(
          kind === 'favorites'
            ? 'Não foi possível remover o título dos favoritos.'
            : 'Não foi possível remover o título da lista Quero assistir.',
        );
        return false;
      } finally {
        setRemovingKey(undefined);
      }
    },
    [kind, removingKey],
  );

  return useMemo(
    () => ({
      items,
      status,
      errorMessage,
      operationError,
      removingKey,
      retry,
      removeItem,
    }),
    [
      errorMessage,
      items,
      operationError,
      removeItem,
      removingKey,
      retry,
      status,
    ],
  );
}

export type { LocalLibraryKind };
