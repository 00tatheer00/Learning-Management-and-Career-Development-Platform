import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { checkInMemoryRateLimit } from "@/lib/security/in-memory-rate-limit";

function createRatelimit(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  const redis = Redis.fromEnv();
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: "eest",
  });
}

export const loginRateLimit = createRatelimit(5, "15 m");

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; reset?: number }> {
  if (!limiter) return { success: true };
  const result = await limiter.limit(identifier);
  return { success: result.success, reset: result.reset };
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

const customLimiters = new Map<string, Ratelimit>();

function getCustomRateLimit(key: string, requests: number, windowSeconds: number) {
  const cacheKey = `${key}:${requests}:${windowSeconds}`;
  if (!customLimiters.has(cacheKey)) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return null;
    }
    const redis = Redis.fromEnv();
    customLimiters.set(
      cacheKey,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
        analytics: true,
        prefix: `eest-${key}`,
      })
    );
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
    const result = await checkRateLimit(limiter, identifier);
    return !result.success;
  }

  const fallback = checkInMemoryRateLimit(identifier, requests, windowSeconds * 1000);
  return !fallback.allowed;
}
