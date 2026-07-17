import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { AppThemeMode } from '@/domain/models/AppThemeMode';
import { appPreferencesRepository } from '@/infrastructure/storage/repositories';

import { darkColors, lightColors, type AppColors } from './colors';

type AppThemeContextValue = {
  mode: AppThemeMode;
  colors: AppColors;
  isHydrated: boolean;
  setMode: (mode: AppThemeMode) => void;
  toggleMode: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [mode, setSelectedMode] = useState<AppThemeMode>('dark');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void appPreferencesRepository
      .getThemeMode()
      .then((storedMode) => {
        if (isMounted && storedMode) {
          setSelectedMode(storedMode);
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

  const setMode = useCallback((nextMode: AppThemeMode) => {
    setSelectedMode(nextMode);
    void appPreferencesRepository.setThemeMode(nextMode);
  }, []);

  const toggleMode = useCallback(() => {
    setSelectedMode((currentMode) => {
      const nextMode = currentMode === 'dark' ? 'light' : 'dark';
      void appPreferencesRepository.setThemeMode(nextMode);
      return nextMode;
    });
  }, []);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      mode,
      colors: mode === 'dark' ? darkColors : lightColors,
      isHydrated,
      setMode,
      toggleMode,
    }),
    [isHydrated, mode, setMode, toggleMode],
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme deve ser usado dentro de AppThemeProvider.');
  }

  return context;
}
