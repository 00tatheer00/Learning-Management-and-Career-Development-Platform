import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { requireTrainerProgram, resolveTrainerId } from "@/lib/auth/trainer-scope";
import { getAssignments, updateSubmission } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";
import { prisma } from "@/lib/prisma";
import { sendSubmissionReviewNotifications } from "@/lib/notifications/submission-review-notice";

const schema = z.object({
  id: z.string(),
  status: z.enum(["approved", "needs_revision"]),
  feedback: z.string().optional(),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  try {
    const programSlug = requireTrainerProgram(user);
    const trainerId = resolveTrainerId(user);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(createApiResponse(false, { message: "Invalid data" }), {
        status: 400,
      });
    }

    const assignments = await getAssignments(programSlug);
    const ownedIds = new Set(
      assignments.filter((a) => a.trainerId === trainerId).map((a) => a.id)
    );

    const existing = await prisma.assignmentSubmission.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return NextResponse.json(createApiResponse(false, { error: "Not found" }), {
        status: 404,
      });
    }

    if (!ownedIds.has(existing.assignmentId)) {
      return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
        status: 403,
      });
    }

    const assignment = assignments.find((item) => item.id === existing.assignmentId);
    const submission = await updateSubmission(parsed.data.id, {
      status: parsed.data.status,
      feedback: parsed.data.feedback,
    });

    if (!submission) {
      return NextResponse.json(createApiResponse(false, { error: "Not found" }), {
        status: 404,
      });
    }

    const student = await prisma.user.findUnique({ where: { id: existing.studentId } });
    if (student && assignment) {
      void sendSubmissionReviewNotifications({
        studentName: student.name,
        email: student.email,
        whatsapp: student.phone ?? undefined,
        assignmentTitle: assignment.title,
        status: parsed.data.status,
        feedback: parsed.data.feedback,
      });
    }

    return NextResponse.json(createApiResponse(true, { data: submission }));
  } catch {
    return NextResponse.json(
      createApiResponse(false, { error: "Trainer course not configured" }),
      { status: 400 }
    );
  }
}
