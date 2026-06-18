import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getAssignments, getLiveSessions, getSubmissions } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }
  const [assignments, sessions, submissions] = await Promise.all([
    getAssignments(),
    getLiveSessions(),
    getSubmissions(),
  ]);
  return NextResponse.json(createApiResponse(true, { data: { assignments, sessions, submissions } }));
}
