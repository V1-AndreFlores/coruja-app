import { AsyncStorageAppPreferencesRepository } from './AsyncStorageAppPreferencesRepository';
import { AsyncStorageJsonStore } from './AsyncStorageJsonStore';
import { AsyncStorageLocalLibraryRepository } from './AsyncStorageLocalLibraryRepository';

const jsonStore = new AsyncStorageJsonStore();

export const appPreferencesRepository =
  new AsyncStorageAppPreferencesRepository(jsonStore);

export const localLibraryRepository =
  new AsyncStorageLocalLibraryRepository(jsonStore);
