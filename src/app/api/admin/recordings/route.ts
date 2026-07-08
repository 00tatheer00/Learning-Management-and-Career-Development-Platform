import { NextResponse } from "next/server";
import { getAdminUser, unauthorizedAdminResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { getAdminRecordingsByProgram } from "@/lib/api/admin-recordings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getAdminUser(request);
  if (!user) return unauthorizedAdminResponse();

  const programs = await getAdminRecordingsByProgram();

  return NextResponse.json(createApiResponse(true, { data: programs }));
}
