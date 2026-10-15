import "server-only";

export interface AIChatConfig {
  apiKey: string | null;
  model: string;
  enabled: boolean;
  dailyLimit: number;
  maxOutputTokens: number;
  maxHistory: number;
  maxMessageLength: number;
  timeoutMs: number;
}

export function getAIChatConfig(): AIChatConfig {
  const apiKey = process.env.GEMINI_API_KEY?.trim() || null;
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const enabled = process.env.AI_CHAT_ENABLED !== "false" && process.env.AI_CHAT_ENABLED !== "0";

  const dailyLimitRaw = parseInt(process.env.AI_CHAT_DAILY_LIMIT || "20", 10);
  const dailyLimit = Number.isFinite(dailyLimitRaw) && dailyLimitRaw > 0 ? dailyLimitRaw : 20;

  const maxTokensRaw = parseInt(process.env.AI_CHAT_MAX_OUTPUT_TOKENS || "500", 10);
  const maxOutputTokens = Number.isFinite(maxTokensRaw) && maxTokensRaw > 0 ? maxTokensRaw : 500;

  const maxHistoryRaw = parseInt(process.env.AI_CHAT_MAX_HISTORY || "8", 10);
  const maxHistory = Number.isFinite(maxHistoryRaw) && maxHistoryRaw > 0 ? maxHistoryRaw : 8;

  return {
    apiKey,
    model,
    enabled,
    dailyLimit,
    maxOutputTokens,
    maxHistory,
    maxMessageLength: 1000,
    timeoutMs: 20000,
  };
}
