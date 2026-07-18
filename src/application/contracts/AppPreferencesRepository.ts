import type { AppThemeMode } from '@/domain/models/AppThemeMode';

export interface AppPreferencesRepository {
  getThemeMode(): Promise<AppThemeMode | null>;
  setThemeMode(mode: AppThemeMode): Promise<void>;
  getStreamingProviderKeys(): Promise<string[]>;
  setStreamingProviderKeys(providerKeys: string[]): Promise<void>;
}
