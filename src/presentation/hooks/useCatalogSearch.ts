import { useCallback, useEffect, useRef, useState } from 'react';

import type { CatalogItemSummary } from '@/domain/models/CatalogItemSummary';
import type { SearchFilters } from '@/domain/models/SearchFilters';
import { catalogRepository } from '@/infrastructure/http/tmdb/repositories';
import { toCatalogErrorMessage } from '@/infrastructure/http/tmdb/TmdbErrors';
import { TMDB } from '@/shared/constants/tmdb';

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

function hasDiscoveryFilters(filters: SearchFilters): boolean {
  return (
    filters.mediaType !== 'all' ||
    Boolean(filters.genre) ||
    Boolean(filters.yearFrom || filters.yearTo) ||
    Boolean(filters.minimumRating) ||
    filters.providerKeys.length > 0 ||
    filters.availability !== 'any'
  );
}

export function useCatalogSearch(query: string, filters: SearchFilters) {
  const normalizedQuery = query.trim();
  const hasTextQuery = normalizedQuery.length >= 2;
  const canDiscover = normalizedQuery.length === 0 && hasDiscoveryFilters(filters);
  const hasSearchCriteria = hasTextQuery || canDiscover;
  const currentCriteriaKey = `${normalizedQuery}:${JSON.stringify(filters)}`;
  const previousCriteriaKeyRef = useRef('');
  const [items, setItems] = useState<CatalogItemSummary[]>([]);
  const [matchedPersonName, setMatchedPersonName] = useState<string>();
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const criteriaChanged = previousCriteriaKeyRef.current !== currentCriteriaKey;
    previousCriteriaKeyRef.current = currentCriteriaKey;

    if (!hasSearchCriteria) {
      setItems([]);
      setMatchedPersonName(undefined);
      setStatus('idle');
      setErrorMessage(undefined);
      return;
    }

    const controller = new AbortController();

    if (criteriaChanged) {
      setItems([]);
      setMatchedPersonName(undefined);
    }

    setStatus('loading');
    setErrorMessage(undefined);

    const execute = () => {
      const request = hasTextQuery
        ? catalogRepository.search(normalizedQuery, filters, controller.signal)
        : catalogRepository.discover(filters, controller.signal);

      void request
        .then((response) => {
          if (controller.signal.aborted) {
            return;
          }

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
    };

    const debounceId = setTimeout(
      execute,
      hasTextQuery ? TMDB.searchDebounceMs : 0,
    );

    return () => {
      clearTimeout(debounceId);
      controller.abort();
    };
  }, [
    currentCriteriaKey,
    filters,
    hasSearchCriteria,
    hasTextQuery,
    normalizedQuery,
    reloadKey,
  ]);

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  return {
    items,
    matchedPersonName,
    status,
    errorMessage,
    hasSearchCriteria,
    isExploration: canDiscover,
    isInitialLoading: status === 'loading' && items.length === 0,
    isRefreshing: status === 'loading' && items.length > 0,
    retry,
  };
}
