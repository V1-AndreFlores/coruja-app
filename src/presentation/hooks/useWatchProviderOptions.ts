import { useEffect, useRef, useState } from 'react';

import type { WatchProviderOption } from '@/domain/models/SearchFilters';
import { catalogRepository } from '@/infrastructure/http/tmdb/repositories';

type ProviderStatus = 'idle' | 'loading' | 'success' | 'error';

export function useWatchProviderOptions(enabled: boolean) {
  const [options, setOptions] = useState<WatchProviderOption[]>([]);
  const [status, setStatus] = useState<ProviderStatus>('idle');
  const hasLoaded = useRef(false);
  const requestInFlight = useRef(false);

  useEffect(() => {
    if (!enabled || hasLoaded.current || requestInFlight.current) {
      return;
    }

    requestInFlight.current = true;
    setStatus('loading');

    void catalogRepository
      .getWatchProviderOptions()
      .then((items) => {
        setOptions(items);
        setStatus('success');
        hasLoaded.current = true;
      })
      .catch(() => {
        setOptions([]);
        setStatus('error');
      })
      .finally(() => {
        requestInFlight.current = false;
      });
  }, [enabled]);

  return { options, status };
}
