import { useEffect, useRef, useState } from 'react';

import type { WatchProviderOption } from '@/domain/models/SearchFilters';
import { catalogRepository } from '@/infrastructure/http/tmdb/repositories';

type ProviderStatus = 'idle' | 'loading' | 'success' | 'error';

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export function useWatchProviderOptions(enabled: boolean) {
  const [options, setOptions] = useState<WatchProviderOption[]>([]);
  const [status, setStatus] = useState<ProviderStatus>('idle');
  const hasLoaded = useRef(false);
  const requestInFlight = useRef(false);

  useEffect(() => {
    if (!enabled || hasLoaded.current || requestInFlight.current) {
      return;
    }

    const controller = new AbortController();
    requestInFlight.current = true;
    setStatus('loading');

    void catalogRepository
      .getWatchProviderOptions(controller.signal)
      .then((items) => {
        if (controller.signal.aborted) {
          return;
        }

        setOptions(items);
        setStatus('success');
        hasLoaded.current = true;
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) {
          setStatus('idle');
          return;
        }

        setOptions([]);
        setStatus('error');
      })
      .finally(() => {
        requestInFlight.current = false;
      });

    return () => controller.abort();
  }, [enabled]);

  return { options, status };
}
