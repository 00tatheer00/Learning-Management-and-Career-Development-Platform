import { NextResponse } from "next/server";
import { requireAdminRead, isNextResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { getAdminStudentProfile } from "@/lib/api/admin-student-profile";

export async function GET(request: Request) {
  const admin = await requireAdminRead();
  if (isNextResponse(admin)) return admin;

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId") ?? undefined;
  const email = searchParams.get("email") ?? undefined;
  const enrollmentId = searchParams.get("enrollmentId") ?? undefined;

  if (!studentId && !email && !enrollmentId) {
    return NextResponse.json(
      createApiResponse(false, { error: "Provide studentId, email, or enrollmentId" }),
      { status: 400 }
    );
  }

  const profile = await getAdminStudentProfile({ studentId, email, enrollmentId });
  if (!profile) {
    return NextResponse.json(createApiResponse(false, { error: "Student not found" }), {
      status: 404,
    });
  }

  return NextResponse.json(createApiResponse(true, { data: profile }));
}
