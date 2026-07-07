import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { getStudentAttendanceSummary } from "@/lib/api/class-attendance";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return NextResponse.json(createApiResponse(false, { error: STUDENT_UR.api.unauthorized }), {
      status: 403,
    });
  }

  const programSlug = user.programSlug ?? "web-development";
  const summary = await getStudentAttendanceSummary(user.id, programSlug);

  return NextResponse.json(createApiResponse(true, { data: summary }));
}
