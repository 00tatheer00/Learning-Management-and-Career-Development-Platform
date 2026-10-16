import "server-only";

import { GoogleGenAI } from "@google/genai";
import { getAIChatConfig } from "./config";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GeminiResponse {
  success: boolean;
  text?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Calls official Google Gemini API via @google/genai SDK.
 * Includes timeout handling, model fallback, quota detection, and safe degradation.
 */
export async function callGeminiChat(params: {
  systemInstruction: string;
  history: ChatMessage[];
  message: string;
}): Promise<GeminiResponse> {
  const config = getAIChatConfig();

  if (!config.enabled) {
    return {
      success: false,
      error: "EEST AI Assistant is currently disabled for scheduled maintenance.",
      statusCode: 503,
    };
  }

  if (!config.apiKey) {
    return {
      success: false,
      error: "AI service is not configured yet. Please check GEMINI_API_KEY.",
      statusCode: 503,
    };
  }

  const ai = new GoogleGenAI({ apiKey: config.apiKey });

  // Map history to Gemini content structure (assistant -> model)
  const contents = params.history.slice(-config.maxHistory).map((item) => ({
    role: item.role === "assistant" ? "model" : "user",
    parts: [{ text: item.content }],
  }));

  // Append latest user message
  contents.push({
    role: "user",
    parts: [{ text: params.message }],
  });

  const generateWithModel = async (modelName: string) => {
    const callPromise = ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: params.systemInstruction,
        maxOutputTokens: config.maxOutputTokens,
        temperature: 0.7,
      },
    });

    // Enforce server-side timeout
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("REQUEST_TIMEOUT")), config.timeoutMs)
    );

    return Promise.race([callPromise, timeoutPromise]);
  };

  const candidateModels = [
    config.model,
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  try {
    let result = null;
    let lastError: unknown = null;

    for (const modelCandidate of candidateModels) {
      try {
        result = await generateWithModel(modelCandidate);
        if (result?.text) break;
      } catch (err: unknown) {
        lastError = err;
        const errStr = String(err);
        // Only try next candidate if model is 404/deprecated/unsupported
        if (
          errStr.includes("not found") ||
          errStr.includes("404") ||
          errStr.includes("unsupported") ||
          errStr.includes("no longer available")
        ) {
          console.warn(`[AIChat] Model ${modelCandidate} unavailable, trying next candidate...`);
          continue;
        }
        // If it's permission denied, quota, or authentication failure, don't loop needlessly
        throw err;
      }
    }

    if (!result?.text && lastError) {
      throw lastError;
    }

    const reply = result?.text?.trim();
    if (!reply) {
      return {
        success: false,
        error: "Received an empty response from AI assistant. Please try rephrasing.",
        statusCode: 502,
      };
    }

    return {
      success: true,
      text: reply,
    };
  } catch (error: unknown) {
    const classified = parseGeminiError(error);

    // Temporary server-side diagnostic: logs provider status and sanitized category without leaking keys
    console.error(
      `[AIChat Provider Diagnostic] Category: ${classified.category} | HTTP Status: ${classified.statusCode} | Detail: ${classified.diagnosticDetail}`
    );

    return {
      success: false,
      error: classified.userMessage,
      statusCode: classified.statusCode,
    };
  }
}

export type GeminiErrorCategory =
  | "AUTHENTICATION_FAILED"
  | "PERMISSION_DENIED"
  | "RESOURCE_EXHAUSTED"
  | "MODEL_NOT_FOUND"
  | "PROVIDER_UNAVAILABLE"
  | "REQUEST_TIMEOUT"
  | "UNEXPECTED_PROVIDER_ERROR";

export interface ClassifiedGeminiError {
  category: GeminiErrorCategory;
  statusCode: number;
  userMessage: string;
  diagnosticDetail: string;
}

/**
 * Parses and sanitizes errors returned by the Gemini API or @google/genai SDK.
 * Distinguishes authentication, permission, quota, model not found, timeout, and provider errors.
 * Redacts any sensitive keys or query parameters from diagnostic details.
 */
export function parseGeminiError(error: unknown): ClassifiedGeminiError {
  const errAny = error as Record<string, unknown> | null | undefined;
  const statusCode = typeof errAny?.status === "number" ? errAny.status : undefined;
  let code = typeof errAny?.code === "number" ? errAny.code : undefined;
  let statusStr = "";
  let messageStr = "";

  const rawMessage = String(errAny?.message || error || "");

  // If the error message wraps a JSON payload from Google APIs, parse code/status/message
  if (rawMessage.includes("{") && rawMessage.includes("}")) {
    try {
      const jsonStart = rawMessage.indexOf("{");
      const jsonEnd = rawMessage.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const parsed = JSON.parse(rawMessage.slice(jsonStart, jsonEnd + 1));
        const errPayload = parsed?.error || parsed;
        if (typeof errPayload?.code === "number") code = errPayload.code;
        if (typeof errPayload?.status === "string") statusStr = errPayload.status;
        if (typeof errPayload?.message === "string") messageStr = errPayload.message;
      }
    } catch {
      // Ignore JSON parse failure, fallback to string matching
    }
  }

  const combined = `${rawMessage} ${messageStr} ${statusStr}`.trim();
  const effectiveStatus = statusCode || code || 500;

  // Sanitize detail string: remove API keys, bearer tokens, or query param tokens
  const sanitizedDetail = combined
    .replace(/AIza[0-9A-Za-z\-_]{20,}/g, "[REDACTED_API_KEY]")
    .replace(/key=[^&\s]+/g, "key=[REDACTED]")
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, "Bearer [REDACTED]")
    .trim()
    .slice(0, 300);

  // 1. Timeout (504)
  if (combined.includes("REQUEST_TIMEOUT") || effectiveStatus === 504) {
    return {
      category: "REQUEST_TIMEOUT",
      statusCode: 504,
      userMessage: "The request took too long to complete. Please try asking again.",
      diagnosticDetail: "Operation timed out waiting for Gemini API response.",
    };
  }

  // 2. Authentication Failure (401 / Invalid Key / Revoked)
  if (
    effectiveStatus === 401 ||
    statusStr === "UNAUTHENTICATED" ||
    combined.includes("API_KEY_INVALID") ||
    combined.includes("API key not valid") ||
    combined.includes("UNAUTHENTICATED")
  ) {
    return {
      category: "AUTHENTICATION_FAILED",
      statusCode: 401,
      userMessage:
        "Google Gemini API authentication failed. The configured API key is invalid or revoked. Please verify GEMINI_API_KEY in your hosting dashboard or .env.local.",
      diagnosticDetail: sanitizedDetail || "API key invalid or unauthenticated",
    };
  }

  // 3. Permission Denied / Project Denied (403)
  if (
    effectiveStatus === 403 ||
    statusStr === "PERMISSION_DENIED" ||
    combined.includes("PERMISSION_DENIED") ||
    combined.includes("denied access")
  ) {
    return {
      category: "PERMISSION_DENIED",
      statusCode: 403,
      userMessage:
        "Google Gemini API project access denied (PERMISSION_DENIED). Please generate a fresh API key at https://aistudio.google.com and update GEMINI_API_KEY.",
      diagnosticDetail: sanitizedDetail || "Project denied access (PERMISSION_DENIED)",
    };
  }

  // 4. Quota Exceeded / Rate Limit (429 / RESOURCE_EXHAUSTED)
  if (
    effectiveStatus === 429 ||
    statusStr === "RESOURCE_EXHAUSTED" ||
    combined.includes("RESOURCE_EXHAUSTED") ||
    combined.includes("quota") ||
    combined.includes("Quota") ||
    combined.includes("rate-limits") ||
    combined.includes("rate limit")
  ) {
    return {
      category: "RESOURCE_EXHAUSTED",
      statusCode: 429,
      userMessage:
        "Google Gemini API quota limit reached for this API key. Please check your account quota at https://ai.google.dev/gemini-api/docs/rate-limits.",
      diagnosticDetail: sanitizedDetail || "Quota exceeded (RESOURCE_EXHAUSTED)",
    };
  }

  // 5. Model Not Found / Unsupported / Deprecated (404)
  if (
    effectiveStatus === 404 ||
    statusStr === "NOT_FOUND" ||
    combined.includes("NOT_FOUND") ||
    combined.includes("not found") ||
    combined.includes("no longer available") ||
    combined.includes("unsupported")
  ) {
    return {
      category: "MODEL_NOT_FOUND",
      statusCode: 404,
      userMessage:
        "The configured Gemini model is not available for this account. Please update GEMINI_MODEL.",
      diagnosticDetail: sanitizedDetail || "Model not found or unsupported (NOT_FOUND)",
    };
  }

  // 6. Provider Service Unavailable (503 / 502 / UNAVAILABLE)
  if (
    effectiveStatus === 503 ||
    effectiveStatus === 502 ||
    statusStr === "UNAVAILABLE" ||
    combined.includes("UNAVAILABLE") ||
    combined.includes("overloaded")
  ) {
    return {
      category: "PROVIDER_UNAVAILABLE",
      statusCode: 503,
      userMessage:
        "Google Gemini API is temporarily unavailable or overloaded. Please try again in a few moments.",
      diagnosticDetail: sanitizedDetail || "Provider service unavailable (503)",
    };
  }

  // 7. Unexpected Provider Error (500)
  return {
    category: "UNEXPECTED_PROVIDER_ERROR",
    statusCode: effectiveStatus >= 400 && effectiveStatus < 600 ? effectiveStatus : 500,
    userMessage:
      "An unexpected error occurred while communicating with the AI service. Please try again later.",
    diagnosticDetail: sanitizedDetail || "Unexpected error occurred during generation",
  };
}
