import { useCallback, useEffect, useState } from 'react';

import type { CatalogItemSummary } from '@/domain/models/CatalogItemSummary';
import { catalogRepository } from '@/infrastructure/http/tmdb/repositories';
import { toCatalogErrorMessage } from '@/infrastructure/http/tmdb/TmdbErrors';

type HomeCatalogState = {
  trending: CatalogItemSummary[];
  popularMovies: CatalogItemSummary[];
  popularTv: CatalogItemSummary[];
  isLoading: boolean;
  errorMessage?: string;
};

const INITIAL_STATE: HomeCatalogState = {
  trending: [],
  popularMovies: [],
  popularTv: [],
  isLoading: true,
};

export function useHomeCatalog() {
  const [state, setState] = useState<HomeCatalogState>(INITIAL_STATE);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setState((current) => ({
      ...current,
      isLoading: true,
      errorMessage: undefined,
    }));

    void Promise.all([
      catalogRepository.getTrending(controller.signal),
      catalogRepository.getPopularMovies(controller.signal),
      catalogRepository.getPopularTv(controller.signal),
    ])
      .then(([trending, popularMovies, popularTv]) => {
        setState({
          trending,
          popularMovies,
          popularTv,
          isLoading: false,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setState((current) => ({
          ...current,
          isLoading: false,
          errorMessage: toCatalogErrorMessage(error),
        }));
      });

    return () => controller.abort();
  }, [reloadKey]);

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  return { ...state, retry };
}
