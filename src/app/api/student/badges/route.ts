import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { getStudentPortalBadgeCounts } from "@/lib/student-portal/badges";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  const counts = await getStudentPortalBadgeCounts(user);
  return NextResponse.json(createApiResponse(true, { data: counts }));
}
