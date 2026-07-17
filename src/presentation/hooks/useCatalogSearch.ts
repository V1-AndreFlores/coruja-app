import { useCallback, useEffect, useState } from 'react';

import type { CatalogItemSummary } from '@/domain/models/CatalogItemSummary';
import { catalogRepository } from '@/infrastructure/http/tmdb/repositories';
import { toCatalogErrorMessage } from '@/infrastructure/http/tmdb/TmdbErrors';
import { TMDB } from '@/shared/constants/tmdb';

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

export function useCatalogSearch(query: string) {
  const normalizedQuery = query.trim();
  const [items, setItems] = useState<CatalogItemSummary[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setItems([]);
      setStatus('idle');
      setErrorMessage(undefined);
      return;
    }

    const controller = new AbortController();
    const debounceId = setTimeout(() => {
      setStatus('loading');
      setErrorMessage(undefined);

      void catalogRepository
        .search(normalizedQuery, controller.signal)
        .then((results) => {
          setItems(results);
          setStatus('success');
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) {
            return;
          }

          setItems([]);
          setStatus('error');
          setErrorMessage(toCatalogErrorMessage(error));
        });
    }, TMDB.searchDebounceMs);

    return () => {
      clearTimeout(debounceId);
      controller.abort();
    };
  }, [normalizedQuery, reloadKey]);

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  return {
    items,
    status,
    errorMessage,
    hasValidQuery: normalizedQuery.length >= 2,
    retry,
  };
}
