import AsyncStorage from '@react-native-async-storage/async-storage';

export class AsyncStorageJsonStore {
  async read<T>(key: string, fallback: T): Promise<T> {
    try {
      const storedValue = await AsyncStorage.getItem(key);

      if (!storedValue) {
        return fallback;
      }

      return JSON.parse(storedValue) as T;
    } catch (error) {
      console.warn(`[Coruja] Não foi possível ler a chave local "${key}".`, error);
      return fallback;
    }
  }

  async write<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[Coruja] Não foi possível persistir a chave local "${key}".`, error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`[Coruja] Não foi possível remover a chave local "${key}".`, error);
      throw error;
    }
  }
}
