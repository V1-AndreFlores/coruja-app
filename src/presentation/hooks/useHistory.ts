import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import type { HistoryEntry } from '@/domain/models/CatalogItemSummary';
import { localLibraryRepository } from '@/infrastructure/storage/repositories';

type HistoryStatus = 'loading' | 'success' | 'error';

type HistoryOperation =
  | { type: 'remove'; key: string }
  | { type: 'clear' }
  | undefined;

function itemKey(item: HistoryEntry): string {
  return `${item.mediaType}:${item.id}`;
}

function sortByMostRecent(items: HistoryEntry[]): HistoryEntry[] {
  return [...items].sort((left, right) => {
    const rightTime = Date.parse(right.viewedAt);
    const leftTime = Date.parse(left.viewedAt);

    if (Number.isNaN(rightTime) || Number.isNaN(leftTime)) {
      return 0;
    }

    return rightTime - leftTime;
  });
}

export function useHistory() {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [status, setStatus] = useState<HistoryStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [operationError, setOperationError] = useState<string>();
  const [operation, setOperation] = useState<HistoryOperation>();
  const [reloadKey, setReloadKey] = useState(0);
  const hasLoadedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      void reloadKey;
      let isActive = true;

      if (!hasLoadedRef.current) {
        setStatus('loading');
      }

      setErrorMessage(undefined);
      setOperationError(undefined);

      void localLibraryRepository
        .getHistory()
        .then((storedItems) => {
          if (!isActive) {
            return;
          }

          setItems(sortByMostRecent(storedItems));
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

          setErrorMessage(
            'Não foi possível carregar o histórico armazenado neste aparelho.',
          );
        });

      return () => {
        isActive = false;
      };
    }, [reloadKey]),
  );

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const removeItem = useCallback(
    async (item: HistoryEntry) => {
      if (operation) {
        return false;
      }

      const key = itemKey(item);
      setOperation({ type: 'remove', key });
      setOperationError(undefined);

      try {
        await localLibraryRepository.removeHistoryEntry(item);
        setItems((currentItems) =>
          currentItems.filter((currentItem) => itemKey(currentItem) !== key),
        );
        return true;
      } catch {
        setOperationError('Não foi possível remover o título do histórico.');
        return false;
      } finally {
        setOperation(undefined);
      }
    },
    [operation],
  );

  const clearHistory = useCallback(async () => {
    if (operation) {
      return false;
    }

    setOperation({ type: 'clear' });
    setOperationError(undefined);

    try {
      await localLibraryRepository.clearHistory();
      setItems([]);
      return true;
    } catch {
      setOperationError('Não foi possível limpar o histórico.');
      return false;
    } finally {
      setOperation(undefined);
    }
  }, [operation]);

  return useMemo(
    () => ({
      items,
      status,
      errorMessage,
      operationError,
      removingKey: operation?.type === 'remove' ? operation.key : undefined,
      isClearing: operation?.type === 'clear',
      retry,
      removeItem,
      clearHistory,
    }),
    [
      clearHistory,
      errorMessage,
      items,
      operation,
      operationError,
      removeItem,
      retry,
      status,
    ],
  );
}
