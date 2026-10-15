import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/ai/chat/route";
import { getCurrentUser } from "@/lib/auth/session";
import { checkAIChatRateLimit } from "@/lib/ai/rate-limiter";
import { callGeminiChat } from "@/lib/ai/gemini-service";

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/ai/rate-limiter", () => ({
  checkAIChatRateLimit: vi.fn(),
}));

vi.mock("@/lib/ai/gemini-service", () => ({
  callGeminiChat: vi.fn(),
}));

vi.mock("@/lib/ai/student-context", () => ({
  getAuthorizedStudentContext: vi.fn().mockResolvedValue({
    name: "Ali Khan",
    role: "student",
    programSlug: "web-development",
    activeLevel: "Module 1",
    approvedLevels: ["Module 1"],
    assignmentsSummary: "No submissions recorded yet.",
    attendanceSummary: "Classes attended: 3",
    scheduleSummary: "Web Development: Monday · Tuesday · Wednesday.",
  }),
}));

describe("POST /api/ai/chat API Route", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.GEMINI_API_KEY = "dummy-key-for-test";
    process.env.AI_CHAT_ENABLED = "true";

    vi.mocked(checkAIChatRateLimit).mockResolvedValue({ allowed: true });
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    vi.mocked(callGeminiChat).mockResolvedValue({
      success: true,
      text: "This is a response from EEST AI Assistant.",
    });
  });

  it("returns 400 if request body has an empty message", async () => {
    const req = new Request("http://localhost:3000/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("empty");
  });

  it("returns 400 if message exceeds 1000 characters", async () => {
    const req = new Request("http://localhost:3000/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "a".repeat(1001) }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("too long");
  });

  it("returns 429 when rate limit is exceeded", async () => {
    vi.mocked(checkAIChatRateLimit).mockResolvedValueOnce({
      allowed: false,
      reason: "Daily limit reached. Please return tomorrow!",
    });

    const req = new Request("http://localhost:3000/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello AI" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("Daily limit reached");
  });

  it("returns 200 with assistant reply for a valid guest message", async () => {
    const req = new Request("http://localhost:3000/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Tell me about Web Development" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.reply).toBe("This is a response from EEST AI Assistant.");
    expect(data.userRole).toBe("guest");
    // Ensure API key is never leaked
    expect(JSON.stringify(data)).not.toContain("dummy-key-for-test");
  });

  it("correctly identifies authenticated student and passes role", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce({
      id: "student-123",
      email: "student@example.com",
      role: "student",
      name: "Ali Khan",
      programSlug: "web-development",
      level: "Module 1",
      approvedLevels: ["Module 1"],
    });

    const req = new Request("http://localhost:3000/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "What is my next class?" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.userRole).toBe("student");
  });

  it("returns 503 when AI_CHAT_ENABLED is false", async () => {
    process.env.AI_CHAT_ENABLED = "false";

    const req = new Request("http://localhost:3000/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("disabled");
  });
});
