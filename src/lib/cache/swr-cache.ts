import { Redis } from "@upstash/redis";

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttlMs: number;
  swrMs: number;
  tags: string[];
}

interface SwrOptions {
  /** How long data is considered completely fresh in milliseconds (default: 60,000 = 1 minute) */
  ttlMs?: number;
  /** How long data can be served stale while revalidating in background (default: 300,000 = 5 minutes) */
  swrMs?: number;
  /** Tags associated with this key for group invalidation */
  tags?: string[];
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlightPromises = new Map<string, Promise<unknown>>();
const tagToKeysMap = new Map<string, Set<string>>();

function getRedisClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  try {
    return Redis.fromEnv();
  } catch {
    return null;
  }
}

/**
 * Executes a fetcher with Stale-While-Revalidate (SWR) caching semantics.
 * Sub-millisecond response for cached items with non-blocking background revalidation.
 */
export async function swrCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: SwrOptions = {}
): Promise<T> {
  const ttlMs = options.ttlMs ?? 60_000;
  const swrMs = options.swrMs ?? 300_000;
  const tags = options.tags ?? [];
  const now = Date.now();

  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;

  // 1. Fully Fresh Hit (< ttlMs)
  if (entry && now - entry.cachedAt < entry.ttlMs) {
    return entry.data;
  }

  // 2. Stale Hit (< swrMs) -> Return stale data immediately, revalidate in background
  if (entry && now - entry.cachedAt < entry.swrMs) {
    void triggerBackgroundRevalidation(key, fetcher, ttlMs, swrMs, tags);
    return entry.data;
  }

  // 3. Cache Miss or Expired -> In-flight deduping
  return executeWithDedup(key, fetcher, ttlMs, swrMs, tags);
}

async function executeWithDedup<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
  swrMs: number,
  tags: string[]
): Promise<T> {
  if (inFlightPromises.has(key)) {
    return inFlightPromises.get(key) as Promise<T>;
  }

  const promise = (async () => {
    try {
      // Check Redis first if available
      const redis = getRedisClient();
      if (redis) {
        try {
          const redisData = await redis.get<T>(`swr:${key}`);
          if (redisData !== null && redisData !== undefined) {
            setMemoryCache(key, redisData, ttlMs, swrMs, tags);
            return redisData;
          }
        } catch {
          // Redis read error, fallback to fetcher
        }
      }

      // Fetch fresh data
      const data = await fetcher();
      setMemoryCache(key, data, ttlMs, swrMs, tags);

      // Save to Redis in background
      if (redis) {
        void redis
          .set(`swr:${key}`, JSON.stringify(data), {
            ex: Math.ceil(swrMs / 1000),
          })
          .catch(() => {});
      }

      return data;
    } finally {
      inFlightPromises.delete(key);
    }
  })();

  inFlightPromises.set(key, promise);
  return promise;
}

function triggerBackgroundRevalidation<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
  swrMs: number,
  tags: string[]
): void {
  if (inFlightPromises.has(key)) return;

  const promise = (async () => {
    try {
      const freshData = await fetcher();
      setMemoryCache(key, freshData, ttlMs, swrMs, tags);

      const redis = getRedisClient();
      if (redis) {
        void redis
          .set(`swr:${key}`, JSON.stringify(freshData), {
            ex: Math.ceil(swrMs / 1000),
          })
          .catch(() => {});
      }
    } catch (e) {
      console.warn(`[SWR] Background revalidation failed for key "${key}":`, e);
    } finally {
      inFlightPromises.delete(key);
    }
  })();

  inFlightPromises.set(key, promise);
}

function setMemoryCache<T>(
  key: string,
  data: T,
  ttlMs: number,
  swrMs: number,
  tags: string[]
): void {
  memoryCache.set(key, {
    data,
    cachedAt: Date.now(),
    ttlMs,
    swrMs,
    tags,
  });

  // Track tags
  for (const tag of tags) {
    if (!tagToKeysMap.has(tag)) {
      tagToKeysMap.set(tag, new Set());
    }
    tagToKeysMap.get(tag)!.add(key);
  }
}

/**
 * Invalidates a specific cached key from memory and Redis.
 */
export async function invalidateCache(key: string): Promise<void> {
  memoryCache.delete(key);
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.del(`swr:${key}`);
    } catch {
      // ignore
    }
  }
}

/**
 * Invalidates all cache entries matching a tag.
 */
export async function invalidateCacheByTag(tag: string): Promise<void> {
  const keys = tagToKeysMap.get(tag);
  if (!keys) return;

  const redis = getRedisClient();
  const keysToDelete = Array.from(keys);

  for (const key of keysToDelete) {
    memoryCache.delete(key);
  }
  tagToKeysMap.delete(tag);

  if (redis && keysToDelete.length > 0) {
    try {
      await Promise.all(keysToDelete.map((k) => redis.del(`swr:${k}`)));
    } catch {
      // ignore
    }
  }
}

/**
 * Clears the entire in-memory cache (primarily for tests).
 */
export function clearMemoryCache(): void {
  memoryCache.clear();
  inFlightPromises.clear();
  tagToKeysMap.clear();
}
