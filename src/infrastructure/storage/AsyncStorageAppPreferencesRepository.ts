import type { AppPreferencesRepository } from '@/application/contracts/AppPreferencesRepository';
import type { AppThemeMode } from '@/domain/models/AppThemeMode';
import { STORAGE_KEYS } from '@/shared/constants/storage';

import { AsyncStorageJsonStore } from './AsyncStorageJsonStore';

function isThemeMode(value: unknown): value is AppThemeMode {
  return value === 'dark' || value === 'light';
}

function normalizeProviderKeys(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0))];
}

export class AsyncStorageAppPreferencesRepository
  implements AppPreferencesRepository
{
  constructor(private readonly store: AsyncStorageJsonStore) {}

  async getThemeMode(): Promise<AppThemeMode | null> {
    const storedMode = await this.store.read<unknown>(STORAGE_KEYS.themeMode, null);
    return isThemeMode(storedMode) ? storedMode : null;
  }

  async setThemeMode(mode: AppThemeMode): Promise<void> {
    await this.store.write(STORAGE_KEYS.themeMode, mode);
  }

  async getStreamingProviderKeys(): Promise<string[]> {
    const storedKeys = await this.store.read<unknown>(
      STORAGE_KEYS.streamingProviderKeys,
      [],
    );
    return normalizeProviderKeys(storedKeys);
  }

  async setStreamingProviderKeys(providerKeys: string[]): Promise<void> {
    await this.store.write(
      STORAGE_KEYS.streamingProviderKeys,
      normalizeProviderKeys(providerKeys),
    );
  }
}
