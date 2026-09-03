import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { requireTrainerProgram } from "@/lib/auth/trainer-scope";
import { updateSubmission } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";
import { prisma } from "@/lib/prisma";
import { sendSubmissionReviewNotifications } from "@/lib/notifications/submission-review-notice";

const schema = z.object({
  id: z.string(),
  status: z.enum(["approved", "needs_revision"]),
  feedback: z.string().optional(),
  marks: z
    .union([z.number(), z.string().regex(/^\d+$/).transform(Number)])
    .refine((v) => v >= 0 && v <= 100, { message: "Marks must be between 0 and 100" })
    .optional()
    .nullable(),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "trainer" && user.role !== "admin")) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  try {
    const isAdmin = user.role === "admin";
    const programSlug = isAdmin ? undefined : requireTrainerProgram(user);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(createApiResponse(false, { message: parsed.error.issues[0]?.message || "Invalid data" }), {
        status: 400,
      });
    }

    const existing = await prisma.assignmentSubmission.findUnique({
      where: { id: parsed.data.id },
      include: { assignment: true },
    });

    if (!existing) {
      return NextResponse.json(createApiResponse(false, { error: "Not found" }), {
        status: 404,
      });
    }

    if (!isAdmin && programSlug && existing.assignment.programSlug !== programSlug) {
      return NextResponse.json(createApiResponse(false, { error: "Unauthorized for this course" }), {
        status: 403,
      });
    }

    const submission = await updateSubmission(parsed.data.id, {
      status: parsed.data.status,
      feedback: parsed.data.feedback,
      marks: parsed.data.marks !== undefined ? parsed.data.marks : undefined,
    });

    if (!submission) {
      return NextResponse.json(createApiResponse(false, { error: "Not found" }), {
        status: 404,
      });
    }

    const student = await prisma.user.findUnique({ where: { id: existing.studentId } });
    if (student && existing.assignment) {
      void sendSubmissionReviewNotifications({
        studentName: student.name,
        email: student.email,
        assignmentTitle: existing.assignment.title,
        status: parsed.data.status,
        feedback: parsed.data.feedback,
      });
    }

    return NextResponse.json(createApiResponse(true, { data: submission }));
  } catch {
    return NextResponse.json(
      createApiResponse(false, { error: "Review processing failed" }),
      { status: 400 }
    );
  }
}
