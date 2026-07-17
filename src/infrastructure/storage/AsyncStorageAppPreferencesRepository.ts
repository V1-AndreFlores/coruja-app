import type { AppPreferencesRepository } from '@/application/contracts/AppPreferencesRepository';
import type { AppThemeMode } from '@/domain/models/AppThemeMode';
import { STORAGE_KEYS } from '@/shared/constants/storage';

import { AsyncStorageJsonStore } from './AsyncStorageJsonStore';

function isThemeMode(value: unknown): value is AppThemeMode {
  return value === 'dark' || value === 'light';
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
}
