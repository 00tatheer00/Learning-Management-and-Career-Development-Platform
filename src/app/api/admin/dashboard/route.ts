import { NextResponse } from "next/server";
import { getAdminUser, unauthorizedAdminResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { getAdminDashboardData } from "@/lib/api/admin-dashboard";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return unauthorizedAdminResponse();

  const data = await getAdminDashboardData();
  const response = NextResponse.json(createApiResponse(true, { data }));
  response.headers.set("Cache-Control", "private, s-maxage=60, stale-while-revalidate=300");
  return response;
}
