import { beforeEach, describe, expect, it } from "vitest";
import {
  checkInMemoryRateLimit,
  clearInMemoryRateLimits,
} from "@/lib/security/in-memory-rate-limit";

describe("in-memory rate limit", () => {
  beforeEach(() => {
    clearInMemoryRateLimits();
  });

  it("allows requests under the limit", () => {
    expect(checkInMemoryRateLimit("test-key", 2, 60_000).allowed).toBe(true);
    expect(checkInMemoryRateLimit("test-key", 2, 60_000).allowed).toBe(true);
  });

  it("blocks requests over the limit", () => {
    checkInMemoryRateLimit("blocked-key", 1, 60_000);
    expect(checkInMemoryRateLimit("blocked-key", 1, 60_000).allowed).toBe(false);
  });
});
