import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getAssignments, getSubmissions } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  const [assignments, submissions] = await Promise.all([
    getAssignments(user.programSlug),
    getSubmissions(user.id),
  ]);

  return NextResponse.json(
    createApiResponse(true, { data: { assignments, submissions } })
  );
}
