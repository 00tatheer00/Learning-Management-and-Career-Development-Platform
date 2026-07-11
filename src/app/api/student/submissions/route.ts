import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createSubmission } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";

const schema = z.object({
  assignmentId: z.string(),
  content: z.string().min(5, STUDENT_UR.api.assignmentMinWords),
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

  const result = await createSubmission(
    {
      assignmentId: parsed.data.assignmentId,
      studentId: user.id,
      studentName: user.name,
      content: parsed.data.content,
    },
    user.programSlug,
    user.level
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
