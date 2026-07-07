import { NextResponse } from "next/server";
import { requireAdminRead, isNextResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { getAdminStudentProfile } from "@/lib/api/admin-student-profile";

export async function GET(request: Request) {
  const admin = await requireAdminRead();
  if (isNextResponse(admin)) return admin;

  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId")?.trim() || undefined;
    const email = searchParams.get("email")?.trim() || undefined;
    const enrollmentId = searchParams.get("enrollmentId")?.trim() || undefined;

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
  } catch (error) {
    console.error("Admin student profile load failed:", error);
    return NextResponse.json(
      createApiResponse(false, {
        error: error instanceof Error ? error.message : "Could not load student profile",
      }),
      { status: 500 }
    );
  }
}
