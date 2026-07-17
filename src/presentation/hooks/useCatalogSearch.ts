import { useCallback, useEffect, useState } from 'react';

import type { CatalogItemSummary } from '@/domain/models/CatalogItemSummary';
import type { SearchFilters } from '@/domain/models/SearchFilters';
import { catalogRepository } from '@/infrastructure/http/tmdb/repositories';
import { toCatalogErrorMessage } from '@/infrastructure/http/tmdb/TmdbErrors';
import { TMDB } from '@/shared/constants/tmdb';

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

export function useCatalogSearch(query: string, filters: SearchFilters) {
  const normalizedQuery = query.trim();
  const [items, setItems] = useState<CatalogItemSummary[]>([]);
  const [matchedPersonName, setMatchedPersonName] = useState<string>();
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setItems([]);
      setMatchedPersonName(undefined);
      setStatus('idle');
      setErrorMessage(undefined);
      return;
    }

    const controller = new AbortController();
    setStatus('loading');
    setMatchedPersonName(undefined);
    setErrorMessage(undefined);

    const debounceId = setTimeout(() => {
      void catalogRepository
        .search(normalizedQuery, filters, controller.signal)
        .then((response) => {
          setItems(response.items);
          setMatchedPersonName(response.matchedPersonName);
          setStatus('success');
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) {
            return;
          }

          setItems([]);
          setMatchedPersonName(undefined);
          setStatus('error');
          setErrorMessage(toCatalogErrorMessage(error));
        });
    }, TMDB.searchDebounceMs);

    return () => {
      clearTimeout(debounceId);
      controller.abort();
    };
  }, [filters, normalizedQuery, reloadKey]);

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  return {
    items,
    matchedPersonName,
    status,
    errorMessage,
    hasValidQuery: normalizedQuery.length >= 2,
    retry,
  };
}
