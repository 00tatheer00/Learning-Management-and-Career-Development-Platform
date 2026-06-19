import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { requireTrainerProgram } from "@/lib/auth/trainer-scope";
import { getAssignments, updateSubmission } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";

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
    const trainerId = user.trainerId ?? user.id;
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

    const submission = await updateSubmission(parsed.data.id, {
      status: parsed.data.status,
      feedback: parsed.data.feedback,
    });

    if (!submission) {
      return NextResponse.json(createApiResponse(false, { error: "Not found" }), {
        status: 404,
      });
    }

    if (!ownedIds.has(submission.assignmentId)) {
      return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
        status: 403,
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
