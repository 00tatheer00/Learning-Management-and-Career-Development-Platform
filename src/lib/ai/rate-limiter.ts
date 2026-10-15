import "server-only";

import {
  getClientIp,
  getCustomRateLimit,
  checkRateLimit,
} from "@/lib/security/rate-limit";
import { checkInMemoryRateLimit } from "@/lib/security/in-memory-rate-limit";
import { getAIChatConfig } from "./config";

export interface RateLimitCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Checks per-user or per-IP rate limits for AI Chat.
 * 1. Burst limit: 5 requests per 30 seconds.
 * 2. Daily limit: configured via AI_CHAT_DAILY_LIMIT (default 20 per 24 hours).
 */
export async function checkAIChatRateLimit(
  request: Request,
  userId?: string | null
): Promise<RateLimitCheckResult> {
  const config = getAIChatConfig();
  const ip = getClientIp(request);
  const identifier = userId ? `user:${userId}` : `ip:${ip}`;

  // 1. Burst Limit Check (5 requests per 30 seconds)
  const burstLimiter = getCustomRateLimit("ai-burst", 5, 30);
  if (burstLimiter) {
    try {
      const burstRes = await checkRateLimit(burstLimiter, `ai-burst:${identifier}`);
      if (!burstRes.error && !burstRes.success) {
        return {
          allowed: false,
          reason: "You are sending messages too quickly. Please pause for a few seconds.",
        };
      }
    } catch {
      // Fall through to in-memory check
    }
  } else {
    const burstMem = checkInMemoryRateLimit(`ai-burst:${identifier}`, 5, 30_000);
    if (!burstMem.allowed) {
      return {
        allowed: false,
        reason: "You are sending messages too quickly. Please pause for a few seconds.",
      };
    }
  }

  // 2. Daily Limit Check
  const dailyWindowSeconds = 86400;
  const dailyLimiter = getCustomRateLimit("ai-daily", config.dailyLimit, dailyWindowSeconds);
  if (dailyLimiter) {
    try {
      const dailyRes = await checkRateLimit(dailyLimiter, `ai-daily:${identifier}`);
      if (!dailyRes.error && !dailyRes.success) {
        return {
          allowed: false,
          reason: `You have reached your daily allowance of ${config.dailyLimit} AI questions. Please return tomorrow!`,
        };
      }
    } catch {
      // Fall through to in-memory check
    }
  } else {
    const dailyMem = checkInMemoryRateLimit(
      `ai-daily:${identifier}`,
      config.dailyLimit,
      dailyWindowSeconds * 1000
    );
    if (!dailyMem.allowed) {
      return {
        allowed: false,
        reason: `You have reached your daily allowance of ${config.dailyLimit} AI questions. Please return tomorrow!`,
      };
    }
  }

  return { allowed: true };
}
