import { NextResponse } from "next/server";
import { getAdminUser, unauthorizedAdminResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { getProgramAttendanceAnalytics } from "@/lib/api/class-attendance";

export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user) return unauthorizedAdminResponse();

  const { searchParams } = new URL(request.url);
  const programSlug = searchParams.get("programSlug") ?? "web-development";

  const analytics = await getProgramAttendanceAnalytics(programSlug);

  return NextResponse.json(createApiResponse(true, { data: analytics }));
}
