import { describe, it, expect, vi, beforeEach } from "vitest";
import { callGeminiChat } from "./gemini-service";

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
});
