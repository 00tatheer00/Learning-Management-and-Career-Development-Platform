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

/**
 * Strips surrounding single or double quotes and whitespace from environment values.
 * Useful when credentials or models are entered into hosting dashboards (e.g. Vercel)
 * or env files with surrounding quotes.
 */
function cleanEnvValue(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  const unquoted = trimmed.replace(/^["']|["']$/g, "").trim();
  return unquoted || null;
}

export function getAIChatConfig(): AIChatConfig {
  // Support standard GEMINI_API_KEY as primary, with GOOGLE_API_KEY / GOOGLE_GENAI_API_KEY as fallbacks
  const apiKey =
    cleanEnvValue(process.env.GEMINI_API_KEY) ||
    cleanEnvValue(process.env.GOOGLE_API_KEY) ||
    cleanEnvValue(process.env.GOOGLE_GENAI_API_KEY) ||
    null;

  const model = cleanEnvValue(process.env.GEMINI_MODEL) || "gemini-3.8-flash";
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
