import { NextResponse } from "next/server";
import { getAdminUser, unauthorizedAdminResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { getAdminRevenueStats } from "@/lib/api/admin-revenue";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return unauthorizedAdminResponse();

  const stats = await getAdminRevenueStats();
  return NextResponse.json(createApiResponse(true, { data: stats }));
}
