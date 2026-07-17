import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import { localLibraryRepository } from '@/infrastructure/storage/repositories';

export type LocalDataKind = 'favorites' | 'watchlist' | 'history' | 'all';

type LocalDataStatus = 'loading' | 'success' | 'error';

type LocalDataCounts = {
  favorites: number;
  watchlist: number;
  history: number;
};

const EMPTY_COUNTS: LocalDataCounts = {
  favorites: 0,
  watchlist: 0,
  history: 0,
};

async function loadCounts(): Promise<LocalDataCounts> {
  const [favorites, watchlist, history] = await Promise.all([
    localLibraryRepository.getFavorites(),
    localLibraryRepository.getWatchlist(),
    localLibraryRepository.getHistory(),
  ]);

  return {
    favorites: favorites.length,
    watchlist: watchlist.length,
    history: history.length,
  };
}

async function clearStoredData(kind: LocalDataKind): Promise<void> {
  switch (kind) {
    case 'favorites':
      await localLibraryRepository.clearFavorites();
      return;
    case 'watchlist':
      await localLibraryRepository.clearWatchlist();
      return;
    case 'history':
      await localLibraryRepository.clearHistory();
      return;
    case 'all':
      await localLibraryRepository.clearAllLibraryData();
  }
}

function updateCountsAfterClear(
  current: LocalDataCounts,
  kind: LocalDataKind,
): LocalDataCounts {
  if (kind === 'all') {
    return EMPTY_COUNTS;
  }

  return {
    ...current,
    [kind]: 0,
  };
}

function successMessageFor(kind: LocalDataKind): string {
  switch (kind) {
    case 'favorites':
      return 'Os favoritos foram removidos deste aparelho.';
    case 'watchlist':
      return 'A lista Quero assistir foi removida deste aparelho.';
    case 'history':
      return 'O histórico foi removido deste aparelho.';
    case 'all':
      return 'Favoritos, Quero assistir e histórico foram removidos deste aparelho.';
  }
}

export function useLocalDataManagement() {
  const [counts, setCounts] = useState<LocalDataCounts>(EMPTY_COUNTS);
  const [status, setStatus] = useState<LocalDataStatus>('loading');
  const [operation, setOperation] = useState<LocalDataKind>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [reloadKey, setReloadKey] = useState(0);
  const hasLoadedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      if (!hasLoadedRef.current) {
        setStatus('loading');
      }

      setErrorMessage(undefined);

      void loadCounts()
        .then((loadedCounts) => {
          if (!isActive) {
            return;
          }

          setCounts(loadedCounts);
          setStatus('success');
          hasLoadedRef.current = true;
        })
        .catch(() => {
          if (!isActive) {
            return;
          }

          setStatus('error');
          setErrorMessage(
            'Não foi possível consultar os dados armazenados neste aparelho.',
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

  const clearData = useCallback(
    async (kind: LocalDataKind) => {
      if (operation) {
        return false;
      }

      setOperation(kind);
      setErrorMessage(undefined);
      setSuccessMessage(undefined);

      try {
        await clearStoredData(kind);
        setCounts((current) => updateCountsAfterClear(current, kind));
        setSuccessMessage(successMessageFor(kind));
        return true;
      } catch {
        setErrorMessage(
          'Não foi possível remover os dados selecionados. Tente novamente.',
        );
        return false;
      } finally {
        setOperation(undefined);
      }
    },
    [operation],
  );

  return useMemo(
    () => ({
      counts,
      status,
      operation,
      isProcessing: Boolean(operation),
      errorMessage,
      successMessage,
      retry,
      clearData,
    }),
    [
      clearData,
      counts,
      errorMessage,
      operation,
      retry,
      status,
      successMessage,
    ],
  );
}
