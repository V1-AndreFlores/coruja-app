import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

import type { AppThemeMode } from '@/domain/models/AppThemeMode';

import { darkColors, lightColors, type AppColors } from './colors';

type AppThemeContextValue = {
  mode: AppThemeMode;
  colors: AppColors;
  setMode: (mode: AppThemeMode) => void;
  toggleMode: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemMode = useColorScheme();
  const [selectedMode, setSelectedMode] = useState<AppThemeMode | null>(null);

  const mode: AppThemeMode =
    selectedMode ?? (systemMode === 'light' ? 'light' : 'dark');

  const setMode = useCallback((nextMode: AppThemeMode) => {
    setSelectedMode(nextMode);
  }, []);

  const toggleMode = useCallback(() => {
    setSelectedMode((currentMode) => {
      const effectiveMode =
        currentMode ?? (systemMode === 'light' ? 'light' : 'dark');
      return effectiveMode === 'dark' ? 'light' : 'dark';
    });
  }, [systemMode]);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      mode,
      colors: mode === 'dark' ? darkColors : lightColors,
      setMode,
      toggleMode,
    }),
    [mode, setMode, toggleMode],
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
