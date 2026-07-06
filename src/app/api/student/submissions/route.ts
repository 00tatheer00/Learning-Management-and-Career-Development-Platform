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
    return NextResponse.json(createApiResponse(false, { error: STUDENT_UR.api.unauthorized }), { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  const submission = await createSubmission({
    assignmentId: parsed.data.assignmentId,
    studentId: user.id,
    studentName: user.name,
    content: parsed.data.content,
  });

  return NextResponse.json(
    createApiResponse(true, { data: submission, message: STUDENT_UR.api.assignmentSuccess })
  );
}
