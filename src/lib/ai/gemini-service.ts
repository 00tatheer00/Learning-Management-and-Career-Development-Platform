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
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-2.0-flash",
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
        // If it's permission denied or quota, don't loop needlessly
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
    const errAny = error as Record<string, unknown>;
    const status = (errAny?.status as number) || (errAny?.code as number);
    const errorObj = (errAny?.error as Record<string, unknown>) || {};
    const code = (errorObj?.code as number) || status;
    const rawMsg = String(errorObj?.message || errAny?.message || error || "");

    // 1. Quota Exceeded (429 / RESOURCE_EXHAUSTED)
    if (
      code === 429 ||
      rawMsg.includes("429") ||
      rawMsg.includes("RESOURCE_EXHAUSTED") ||
      rawMsg.includes("quota") ||
      rawMsg.includes("Quota") ||
      rawMsg.includes("rate-limits")
    ) {
      return {
        success: false,
        error: "Google Gemini API quota limit reached for this API key. Please check your account quota at https://ai.google.dev/gemini-api/docs/rate-limits.",
        statusCode: 429,
      };
    }

    // 2. Permission Denied / Project Denied / Invalid API key (403)
    if (
      code === 403 ||
      code === 401 ||
      rawMsg.includes("403") ||
      rawMsg.includes("PERMISSION_DENIED") ||
      rawMsg.includes("denied access") ||
      rawMsg.includes("API_KEY_INVALID")
    ) {
      return {
        success: false,
        error: "Google Gemini API project access denied (PERMISSION_DENIED). Please generate a fresh API key at https://aistudio.google.com and update GEMINI_API_KEY.",
        statusCode: 403,
      };
    }

    // 3. Timeout (504)
    if (rawMsg.includes("REQUEST_TIMEOUT")) {
      return {
        success: false,
        error: "The request took too long to complete. Please try asking again.",
        statusCode: 504,
      };
    }

    // 4. Model not found (404)
    if (
      code === 404 ||
      rawMsg.includes("404") ||
      rawMsg.includes("NOT_FOUND") ||
      rawMsg.includes("no longer available")
    ) {
      return {
        success: false,
        error: "The configured Gemini model is not available for this account. Please update GEMINI_MODEL.",
        statusCode: 404,
      };
    }

    console.error("[AIChat] Gemini API generation error:", rawMsg);

    return {
      success: false,
      error: "An unexpected error occurred while communicating with the AI service. Please try again later.",
      statusCode: 500,
    };
  }
}
