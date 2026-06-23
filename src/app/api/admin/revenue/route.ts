import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getAdminRevenueStats } from "@/lib/api/admin-revenue";
import { createApiResponse } from "@/lib/api/enrollment";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  try {
    const stats = await getAdminRevenueStats();
    return NextResponse.json(createApiResponse(true, { data: stats }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load revenue";
    return NextResponse.json(createApiResponse(false, { error: message }), { status: 500 });
  }
}
