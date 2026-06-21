import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { getAdminRegistrationNotifications } from "@/lib/api/admin-notifications";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const data = await getAdminRegistrationNotifications();
  return NextResponse.json(createApiResponse(true, { data }));
}
