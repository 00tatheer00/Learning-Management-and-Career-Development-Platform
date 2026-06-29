import { NextResponse } from "next/server";
import { getAdminUser, unauthorizedAdminResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { getAdminDashboardData } from "@/lib/api/admin-dashboard";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return unauthorizedAdminResponse();

  const data = await getAdminDashboardData();
  return NextResponse.json(createApiResponse(true, { data }));
}
