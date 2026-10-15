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

  try {
    let result;
    try {
      result = await generateWithModel(config.model);
    } catch (firstErr: unknown) {
      const errStr = String(firstErr);
      // Fallback model if primary model is 404 or unsupported
      if (
        (errStr.includes("not found") || errStr.includes("404") || errStr.includes("unsupported")) &&
        config.model !== "gemini-2.0-flash"
      ) {
        console.warn(`[AIChat] Primary model ${config.model} failed, falling back to gemini-2.0-flash`);
        result = await generateWithModel("gemini-2.0-flash");
      } else {
        throw firstErr;
      }
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
    const errorMsg = String(error);

    // Timeout
    if (errorMsg.includes("REQUEST_TIMEOUT")) {
      return {
        success: false,
        error: "The request took too long to complete. Please try asking again.",
        statusCode: 504,
      };
    }

    // Rate Limit / Quota Exceeded (429, RESOURCE_EXHAUSTED)
    if (
      errorMsg.includes("429") ||
      errorMsg.includes("RESOURCE_EXHAUSTED") ||
      errorMsg.includes("quota") ||
      errorMsg.includes("Quota")
    ) {
      return {
        success: false,
        error: "The AI assistant is experiencing high traffic right now (quota limit reached). Please try again in a few moments.",
        statusCode: 429,
      };
    }

    console.error("[AIChat] Gemini API generation error:", errorMsg);

    return {
      success: false,
      error: "An unexpected error occurred while communicating with the AI service. Please try again later.",
      statusCode: 500,
    };
  }
}
