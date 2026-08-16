import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createSubmission } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";

const schema = z.object({
  assignmentId: z.string(),
  content: z.string().optional(),
  liveWebsiteUrl: z.string().url("Please provide a valid Live Website URL (e.g. https://...)").optional().or(z.literal("")),
  githubUrl: z.string().url("Please provide a valid GitHub Repository URL (e.g. https://github.com/...)").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Please provide a valid Portfolio URL (e.g. https://...)").optional().or(z.literal("")),
  assignedTopic: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return NextResponse.json(createApiResponse(false, { error: STUDENT_UR.api.unauthorized }), {
      status: 403,
    });
  }

  if (!user.programSlug) {
    return NextResponse.json(
      createApiResponse(false, { error: "Your course is not assigned yet." }),
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  const {
    assignmentId,
    content: rawContent,
    liveWebsiteUrl,
    githubUrl,
    portfolioUrl,
    assignedTopic,
    notes,
  } = parsed.data;

  // Build a structured content summary if URLs are provided
  let content = rawContent?.trim() || "";
  if (!content) {
    const parts: string[] = [];
    if (assignedTopic) parts.push(`Assigned Topic: ${assignedTopic}`);
    if (liveWebsiteUrl) parts.push(`Live Website: ${liveWebsiteUrl}`);
    if (githubUrl) parts.push(`GitHub Repo: ${githubUrl}`);
    if (portfolioUrl) parts.push(`Portfolio: ${portfolioUrl}`);
    if (notes) parts.push(`Notes: ${notes}`);
    content = parts.join("\n") || "Assignment submission";
  }

  const result = await createSubmission(
    {
      assignmentId,
      studentId: user.id,
      studentName: user.name,
      content,
      liveWebsiteUrl: liveWebsiteUrl || undefined,
      githubUrl: githubUrl || undefined,
      portfolioUrl: portfolioUrl || undefined,
      assignedTopic: assignedTopic || undefined,
      notes: notes || undefined,
    },
    user.programSlug ?? "web-development",
    user.level,
    user.email
  );

  if (!result.submission) {
    return NextResponse.json(
      createApiResponse(false, { error: result.error ?? "Could not submit assignment" }),
      { status: result.error === "Assignment not found" ? 404 : 403 }
    );
  }

  return NextResponse.json(
    createApiResponse(true, { data: result.submission, message: STUDENT_UR.api.assignmentSuccess })
  );
}
