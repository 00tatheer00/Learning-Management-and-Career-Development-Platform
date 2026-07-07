interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Process-local fallback when Upstash is not configured. */
export function checkInMemoryRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; resetAt?: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true };
}

export function clearInMemoryRateLimits(): void {
  buckets.clear();
}
