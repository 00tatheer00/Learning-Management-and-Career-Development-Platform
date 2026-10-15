import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { getAIChatConfig } from "@/lib/ai/config";
import { checkAIChatRateLimit } from "@/lib/ai/rate-limiter";
import { getRelevantKnowledge } from "@/lib/ai/knowledge-base";
import { getAuthorizedStudentContext } from "@/lib/ai/student-context";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { callGeminiChat } from "@/lib/ai/gemini-service";

const chatRequestSchema = z.object({
  message: z
    .string({ message: "Message is required" })
    .trim()
    .min(1, "Message cannot be empty")
    .max(1000, "Message is too long (maximum 1,000 characters)"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      })
    )
    .max(8, "History cannot exceed 8 messages")
    .optional()
    .default([]),
});

export async function POST(request: Request) {
  try {
    const config = getAIChatConfig();

    if (!config.enabled) {
      return NextResponse.json(
        {
          success: false,
          error: "EEST AI Assistant is currently disabled for scheduled maintenance.",
        },
        { status: 503 }
      );
    }

    if (!config.apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "AI service is temporarily unconfigured. Please contact academy support.",
        },
        { status: 503 }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const validation = chatRequestSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage =
        validation.error.issues[0]?.message || "Invalid chat request format.";
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const { message, history } = validation.data;

    // Determine current user if authenticated
    const currentUser = await getCurrentUser(request);
    const userId = currentUser?.id ?? null;

    // Apply rate limits (burst + daily)
    const rateCheck = await checkAIChatRateLimit(request, userId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateCheck.reason || "Rate limit reached. Please try again later.",
        },
        { status: 429 }
      );
    }

    // Safely retrieve authorized student context if user is a student
    let studentContext = null;
    if (currentUser) {
      studentContext = await getAuthorizedStudentContext(currentUser);
    }

    // Retrieve relevant verified knowledge base snippets
    const knowledgeSnippets = getRelevantKnowledge(message);

    // Build strict system prompt
    const systemInstruction = buildSystemPrompt({
      studentContext,
      knowledgeSnippets,
    });

    // Call Gemini API via official SDK
    const geminiResult = await callGeminiChat({
      systemInstruction,
      history,
      message,
    });

    if (!geminiResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: geminiResult.error || "Failed to process chat response.",
        },
        { status: geminiResult.statusCode || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reply: geminiResult.text,
      userRole: currentUser?.role || "guest",
    });
  } catch (error) {
    console.error("[AIChat] Unexpected error in chat route:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again in a few moments.",
      },
      { status: 500 }
    );
  }
}
