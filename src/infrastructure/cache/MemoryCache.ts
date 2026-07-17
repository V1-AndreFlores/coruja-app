type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

export class MemoryCache {
  private readonly entries = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.entries.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.entries.set(key, {
      expiresAt: Date.now() + ttlMs,
      value,
    });
  }
}
