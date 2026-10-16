import { describe, it, expect, vi, beforeEach } from "vitest";
import { callGeminiChat, parseGeminiError } from "./gemini-service";

// Mock @google/genai
const mockGenerateContent = vi.fn();

vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent,
      },
    })),
  };
});

describe("Gemini Service (callGeminiChat)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.GEMINI_API_KEY = "test-fake-key-12345";
    process.env.GEMINI_MODEL = "gemini-2.5-flash";
    process.env.AI_CHAT_ENABLED = "true";
  });

  it("returns error when AI chat is disabled", async () => {
    process.env.AI_CHAT_ENABLED = "false";
    const result = await callGeminiChat({
      systemInstruction: "test instruction",
      history: [],
      message: "hello",
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(503);
    expect(result.error).toContain("disabled");
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("returns error when GEMINI_API_KEY is missing", async () => {
    delete process.env.GEMINI_API_KEY;
    const result = await callGeminiChat({
      systemInstruction: "test instruction",
      history: [],
      message: "hello",
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(503);
    expect(result.error).toContain("not configured");
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("returns successfully formatted text response when SDK succeeds", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: "Hello! Welcome to EEST Academy.",
    });

    const result = await callGeminiChat({
      systemInstruction: "You are EEST Assistant",
      history: [{ role: "user", content: "Hi" }],
      message: "Tell me about EEST",
    });

    expect(result.success).toBe(true);
    expect(result.text).toBe("Hello! Welcome to EEST Academy.");
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("handles quota exceeded / rate limit errors safely", async () => {
    mockGenerateContent.mockRejectedValueOnce(
      new Error("429 Too Many Requests: RESOURCE_EXHAUSTED quota exceeded")
    );

    const result = await callGeminiChat({
      systemInstruction: "test",
      history: [],
      message: "test query",
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(429);
    expect(result.error).toContain("quota limit reached");
    // Ensure API key is NOT leaked in error
    expect(result.error).not.toContain("test-fake-key-12345");
  });

  it("handles provider timeout gracefully", async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error("REQUEST_TIMEOUT"));

    const result = await callGeminiChat({
      systemInstruction: "test",
      history: [],
      message: "test query",
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(504);
    expect(result.error).toContain("took too long");
  });

  it("handles 403 PERMISSION_DENIED error safely without leaking key", async () => {
    mockGenerateContent.mockRejectedValueOnce({
      status: 403,
      message: '{"error":{"code":403,"message":"Your project has been denied access. Please contact support.","status":"PERMISSION_DENIED"}}',
    });

    const result = await callGeminiChat({
      systemInstruction: "test",
      history: [],
      message: "test query",
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(403);
    expect(result.error).toContain("PERMISSION_DENIED");
    expect(result.error).toContain("Google Gemini API project access denied");
    expect(result.error).not.toContain("test-fake-key-12345");
  });

  it("handles 401 UNAUTHENTICATED / invalid API key error distinctly from 403", async () => {
    mockGenerateContent.mockRejectedValueOnce({
      status: 401,
      message: '{"error":{"code":401,"message":"API key not valid. Please pass a valid API key.","status":"UNAUTHENTICATED"}}',
    });

    const result = await callGeminiChat({
      systemInstruction: "test",
      history: [],
      message: "test query",
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.error).toContain("authentication failed");
    expect(result.error).not.toContain("PERMISSION_DENIED");
  });

  it("handles 404 NOT_FOUND error for unavailable/deprecated models", async () => {
    mockGenerateContent.mockRejectedValue({
      status: 404,
      message: '{"error":{"code":404,"message":"models/gemini-old is not found for API version v1beta","status":"NOT_FOUND"}}',
    });

    const result = await callGeminiChat({
      systemInstruction: "test",
      history: [],
      message: "test query",
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(404);
    expect(result.error).toContain("not available");
  });

  it("handles 503 PROVIDER_UNAVAILABLE service outage gracefully", async () => {
    mockGenerateContent.mockRejectedValueOnce({
      status: 503,
      message: '{"error":{"code":503,"message":"The model is overloaded. Please try again later.","status":"UNAVAILABLE"}}',
    });

    const result = await callGeminiChat({
      systemInstruction: "test",
      history: [],
      message: "test query",
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(503);
    expect(result.error).toContain("temporarily unavailable");
  });

  it("supports GOOGLE_API_KEY when GEMINI_API_KEY is not defined", async () => {
    delete process.env.GEMINI_API_KEY;
    process.env.GOOGLE_API_KEY = "fallback-google-key";

    mockGenerateContent.mockResolvedValueOnce({
      text: "Reply using fallback GOOGLE_API_KEY",
    });

    const result = await callGeminiChat({
      systemInstruction: "test",
      history: [],
      message: "test query",
    });

    expect(result.success).toBe(true);
    expect(result.text).toBe("Reply using fallback GOOGLE_API_KEY");
  });

  it("strips quotes from GEMINI_API_KEY and GEMINI_MODEL", async () => {
    process.env.GEMINI_API_KEY = '"quoted-api-key"';
    process.env.GEMINI_MODEL = '"gemini-3.8-flash"';

    mockGenerateContent.mockResolvedValueOnce({
      text: "Reply with unquoted config",
    });

    const result = await callGeminiChat({
      systemInstruction: "test",
      history: [],
      message: "test query",
    });

    expect(result.success).toBe(true);
    expect(result.text).toBe("Reply with unquoted config");
  });
});

describe("parseGeminiError diagnostic sanitizer", () => {
  it("redacts Google API keys and bearer tokens from diagnostic details", () => {
    const rawError = {
      status: 403,
      message:
        "Request to https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyDUMMYKEY12345678901234567890123 failed with Authorization: Bearer secret-token-xyz",
    };

    const classified = parseGeminiError(rawError);

    expect(classified.category).toBe("PERMISSION_DENIED");
    expect(classified.statusCode).toBe(403);
    expect(classified.diagnosticDetail).not.toContain("AIzaSyDUMMYKEY12345678901234567890123");
    expect(classified.diagnosticDetail).not.toContain("secret-token-xyz");
    expect(classified.diagnosticDetail).toContain("[REDACTED");
  });

  it("safely handles non-object errors or empty errors", () => {
    const classified = parseGeminiError(null);
    expect(classified.category).toBe("UNEXPECTED_PROVIDER_ERROR");
    expect(classified.statusCode).toBe(500);
  });
});
