import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  swrCache,
  invalidateCache,
  invalidateCacheByTag,
  clearMemoryCache,
} from "@/lib/cache/swr-cache";

describe("swr-cache", () => {
  beforeEach(() => {
    clearMemoryCache();
    vi.clearAllMocks();
  });

  it("caches fetcher result and avoids redundant calls", async () => {
    const fetcher = vi.fn().mockResolvedValue({ status: "ok", num: 100 });

    const res1 = await swrCache("test-key", fetcher, { ttlMs: 1000 });
    const res2 = await swrCache("test-key", fetcher, { ttlMs: 1000 });

    expect(res1).toEqual({ status: "ok", num: 100 });
    expect(res2).toEqual({ status: "ok", num: 100 });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("deduplicates concurrent in-flight requests", async () => {
    const fetcher = vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { timestamp: Date.now() };
    });

    const [res1, res2, res3] = await Promise.all([
      swrCache("concurrent-key", fetcher),
      swrCache("concurrent-key", fetcher),
      swrCache("concurrent-key", fetcher),
    ]);

    expect(res1).toEqual(res2);
    expect(res2).toEqual(res3);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("invalidates cache explicitly by key", async () => {
    let count = 0;
    const fetcher = vi.fn().mockImplementation(async () => ({ count: ++count }));

    const first = await swrCache("key-to-del", fetcher, { ttlMs: 5000 });
    expect(first.count).toBe(1);

    await invalidateCache("key-to-del");

    const second = await swrCache("key-to-del", fetcher, { ttlMs: 5000 });
    expect(second.count).toBe(2);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("invalidates cache by tag", async () => {
    let callCount = 0;
    const fetcher = vi.fn().mockImplementation(async () => ({ val: ++callCount }));

    await swrCache("item-1", fetcher, { ttlMs: 5000, tags: ["certs"] });
    await swrCache("item-2", fetcher, { ttlMs: 5000, tags: ["certs"] });
    expect(fetcher).toHaveBeenCalledTimes(2);

    await invalidateCacheByTag("certs");

    await swrCache("item-1", fetcher, { ttlMs: 5000, tags: ["certs"] });
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
});
