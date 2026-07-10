import { NextResponse } from "next/server";
import { getAdminUser, unauthorizedAdminResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { getSessionAttendanceDetail } from "@/lib/api/class-attendance";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUser();
  if (!user) return unauthorizedAdminResponse();

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const programSlug = searchParams.get("programSlug") ?? "web-development";
  const batch = searchParams.get("batch") ?? undefined;

  const detail = await getSessionAttendanceDetail(id, programSlug, batch);
  if (!detail) {
    return NextResponse.json(createApiResponse(false, { error: "Session not found" }), {
      status: 404,
    });
  }

  return NextResponse.json(createApiResponse(true, { data: detail }));
}
