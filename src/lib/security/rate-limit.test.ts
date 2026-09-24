import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getClientIp,
  checkRateLimit,
  rateLimitByIp,
  clearCustomLimitersForTesting,
} from "./rate-limit";
import { clearInMemoryRateLimits } from "./in-memory-rate-limit";

describe("rate-limit module", () => {
  beforeEach(() => {
    clearInMemoryRateLimits();
    clearCustomLimitersForTesting();
    vi.restoreAllMocks();
  });

  describe("getClientIp", () => {
    it("extracts first ip from x-forwarded-for header", () => {
      const req = new Request("http://localhost", {
        headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
      });
      expect(getClientIp(req)).toBe("203.0.113.195");
    });

    it("extracts cf-connecting-ip if present", () => {
      const req = new Request("http://localhost", {
        headers: { "cf-connecting-ip": "198.51.100.42" },
      });
      expect(getClientIp(req)).toBe("198.51.100.42");
    });

    it("falls back to 127.0.0.1 when no ip headers exist", () => {
      const req = new Request("http://localhost");
      expect(getClientIp(req)).toBe("127.0.0.1");
    });
  });

  describe("checkRateLimit fallback on error", () => {
    it("returns success: true when limiter is null", async () => {
      const res = await checkRateLimit(null, "some-id");
      expect(res.success).toBe(true);
    });

    it("catches limiter errors and safely returns fallback instead of throwing", async () => {
      const mockLimiter = {
        limit: vi.fn().mockRejectedValue(new Error("Upstash Redis connection timeout")),
      } as unknown as Parameters<typeof checkRateLimit>[0];

      const res = await checkRateLimit(mockLimiter, "user-ip");
      expect(res.success).toBe(true);
      expect(res.error).toBeDefined();
    });
  });

  describe("rateLimitByIp with in-memory fallback", () => {
    it("allows within rate limit", async () => {
      const req = new Request("http://localhost", {
        headers: { "x-forwarded-for": "10.0.0.1" },
      });

      const blocked1 = await rateLimitByIp(req, "test-ip-key", 2, 60);
      expect(blocked1).toBe(false);

      const blocked2 = await rateLimitByIp(req, "test-ip-key", 2, 60);
      expect(blocked2).toBe(false);
    });

    it("blocks when limit exceeded in memory", async () => {
      const req = new Request("http://localhost", {
        headers: { "x-forwarded-for": "10.0.0.2" },
      });

      await rateLimitByIp(req, "strict-key", 1, 60);
      const blocked = await rateLimitByIp(req, "strict-key", 1, 60);
      expect(blocked).toBe(true);
    });
  });
});
