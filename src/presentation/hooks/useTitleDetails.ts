import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  CatalogItemSummary,
  MediaType,
} from '@/domain/models/CatalogItemSummary';
import type { TitleDetails } from '@/domain/models/TitleDetails';
import { catalogRepository } from '@/infrastructure/http/tmdb/repositories';
import { toCatalogErrorMessage } from '@/infrastructure/http/tmdb/TmdbErrors';
import { localLibraryRepository } from '@/infrastructure/storage/repositories';

type DetailsStatus = 'loading' | 'success' | 'error';

function itemKey(item: { mediaType: MediaType; id: number }): string {
  return `${item.mediaType}:${item.id}`;
}

function toCatalogSummary(details: TitleDetails): CatalogItemSummary {
  return {
    id: details.id,
    mediaType: details.mediaType,
    title: details.title,
    posterPath: details.posterPath,
    backdropPath: details.backdropPath,
    releaseYear: details.releaseYear,
    overview: details.overview,
    voteAverage: details.voteAverage,
  };
}

export function useTitleDetails(mediaType: MediaType, id: number) {
  const [details, setDetails] = useState<TitleDetails>();
  const [status, setStatus] = useState<DetailsStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [reloadKey, setReloadKey] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isUpdatingLibrary, setIsUpdatingLibrary] = useState(false);
  const [libraryError, setLibraryError] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();

    setStatus('loading');
    setErrorMessage(undefined);
    setLibraryError(undefined);

    void catalogRepository
      .getTitleDetails(mediaType, id, controller.signal)
      .then((loadedDetails) => {
        if (controller.signal.aborted) {
          return;
        }

        setDetails(loadedDetails);
        setStatus('success');

        const summary = toCatalogSummary(loadedDetails);
        void Promise.all([
          localLibraryRepository.getFavorites(),
          localLibraryRepository.getWatchlist(),
        ])
          .then(([favorites, watchlist]) => {
            if (controller.signal.aborted) {
              return;
            }

            const key = itemKey(summary);
            setIsFavorite(favorites.some((item) => itemKey(item) === key));
            setIsInWatchlist(watchlist.some((item) => itemKey(item) === key));
          })
          .catch(() => {
            if (!controller.signal.aborted) {
              setLibraryError('Não foi possível carregar suas listas locais.');
            }
          });

        void localLibraryRepository.addHistoryEntry(summary).catch(() => {
          // Falhas no histórico não impedem a consulta do título.
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setStatus('error');
        setErrorMessage(toCatalogErrorMessage(error));
      });

    return () => controller.abort();
  }, [id, mediaType, reloadKey]);

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const toggleFavorite = useCallback(async () => {
    if (!details || isUpdatingLibrary) {
      return;
    }

    const nextValue = !isFavorite;
    const summary = toCatalogSummary(details);
    setIsFavorite(nextValue);
    setIsUpdatingLibrary(true);
    setLibraryError(undefined);

    try {
      await localLibraryRepository.setFavorite(summary, nextValue);
    } catch {
      setIsFavorite(!nextValue);
      setLibraryError('Não foi possível atualizar seus favoritos.');
    } finally {
      setIsUpdatingLibrary(false);
    }
  }, [details, isFavorite, isUpdatingLibrary]);

  const toggleWatchlist = useCallback(async () => {
    if (!details || isUpdatingLibrary) {
      return;
    }

    const nextValue = !isInWatchlist;
    const summary = toCatalogSummary(details);
    setIsInWatchlist(nextValue);
    setIsUpdatingLibrary(true);
    setLibraryError(undefined);

    try {
      await localLibraryRepository.setWatchlistItem(summary, nextValue);
    } catch {
      setIsInWatchlist(!nextValue);
      setLibraryError('Não foi possível atualizar a lista Quero assistir.');
    } finally {
      setIsUpdatingLibrary(false);
    }
  }, [details, isInWatchlist, isUpdatingLibrary]);

  return useMemo(
    () => ({
      details,
      status,
      errorMessage,
      retry,
      isFavorite,
      isInWatchlist,
      isUpdatingLibrary,
      libraryError,
      toggleFavorite,
      toggleWatchlist,
    }),
    [
      details,
      errorMessage,
      isFavorite,
      isInWatchlist,
      isUpdatingLibrary,
      libraryError,
      retry,
      status,
      toggleFavorite,
      toggleWatchlist,
    ],
  );
}
