import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { checkInMemoryRateLimit } from "@/lib/security/in-memory-rate-limit";

export interface RateLimitResult {
  success: boolean;
  reset?: number;
  error?: unknown;
}

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<RateLimitResult> {
  if (!limiter) return { success: true };
  try {
    const result = await limiter.limit(identifier);
    return { success: result.success, reset: result.reset };
  } catch (error) {
    console.warn(`[RateLimit] Upstash Redis rate limit check failed, falling back to memory:`, error);
    return { success: true, error };
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first && first !== "unknown") return first;
  }

  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp && cfIp !== "unknown") return cfIp;

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && realIp !== "unknown") return realIp;

  const vercelIp = request.headers.get("x-vercel-proxied-for")?.trim();
  if (vercelIp && vercelIp !== "unknown") return vercelIp;

  return "127.0.0.1";
}

const customLimiters = new Map<string, Ratelimit>();

export function clearCustomLimitersForTesting() {
  customLimiters.clear();
}

export function getCustomRateLimit(
  key: string,
  requests: number,
  windowSeconds: number
): Ratelimit | null {
  const cacheKey = `${key}:${requests}:${windowSeconds}`;
  if (!customLimiters.has(cacheKey)) {
    const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    if (!url || !token) {
      return null;
    }

    try {
      const redis = new Redis({ url, token });
      customLimiters.set(
        cacheKey,
        new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
          analytics: true,
          prefix: `eest-${key}`,
        })
      );
    } catch (e) {
      console.warn(`[RateLimit] Failed to initialize Upstash Redis for ${key}:`, e);
      return null;
    }
  }
  return customLimiters.get(cacheKey) ?? null;
}

export async function rateLimitByIp(
  request: Request,
  key: string,
  requests: number,
  windowSeconds: number
): Promise<boolean> {
  const ip = getClientIp(request);
  const identifier = `${key}:${ip}`;
  const limiter = getCustomRateLimit(key, requests, windowSeconds);

  if (limiter) {
    try {
      const result = await checkRateLimit(limiter, identifier);
      if (!result.error) {
        return !result.success;
      }
    } catch {
      // Fall through to in-memory rate limiting on error
    }
  }

  const fallback = checkInMemoryRateLimit(identifier, requests, windowSeconds * 1000);
  return !fallback.allowed;
}
