import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { appPreferencesRepository } from '@/infrastructure/storage/repositories';

type StreamingPreferencesContextValue = {
  providerKeys: string[];
  isHydrated: boolean;
  setProviderKeys: (providerKeys: string[]) => Promise<void>;
};

const StreamingPreferencesContext = createContext<
  StreamingPreferencesContextValue | undefined
>(undefined);

function normalizeProviderKeys(providerKeys: string[]): string[] {
  return [...new Set(providerKeys.filter((key) => key.trim().length > 0))];
}

export function StreamingPreferencesProvider({ children }: PropsWithChildren) {
  const [providerKeys, setSelectedProviderKeys] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void appPreferencesRepository
      .getStreamingProviderKeys()
      .then((storedKeys) => {
        if (isMounted) {
          setSelectedProviderKeys(storedKeys);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setProviderKeys = useCallback(async (nextProviderKeys: string[]) => {
    const normalizedKeys = normalizeProviderKeys(nextProviderKeys);
    setSelectedProviderKeys(normalizedKeys);
    await appPreferencesRepository.setStreamingProviderKeys(normalizedKeys);
  }, []);

  const value = useMemo<StreamingPreferencesContextValue>(
    () => ({ providerKeys, isHydrated, setProviderKeys }),
    [isHydrated, providerKeys, setProviderKeys],
  );

  return (
    <StreamingPreferencesContext.Provider value={value}>
      {children}
    </StreamingPreferencesContext.Provider>
  );
}

export function useStreamingPreferences(): StreamingPreferencesContextValue {
  const context = useContext(StreamingPreferencesContext);

  if (!context) {
    throw new Error(
      'useStreamingPreferences deve ser usado dentro de StreamingPreferencesProvider.',
    );
  }

  return context;
}
