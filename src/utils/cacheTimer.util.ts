export function createCacheWithExpiry<T>(durationMs: number) {
  let expiresAt: Date | null = null;
  let cache: T | null = null;

  return {
    isExpired(): boolean {
      return !expiresAt || new Date() > expiresAt;
    },
    set(value: T): void {
      cache = value;
      expiresAt = new Date(Date.now() + durationMs);
    },
    get(): T | null {
      return cache;
    },
    getExpiry(): string | null {
      return expiresAt ? expiresAt.toISOString() : null;
    },
  };
}
