import { NextResponse } from "next/server";
import { getAdminUser, unauthorizedAdminResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { getAdminRegistrationNotifications } from "@/lib/api/admin-notifications";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return unauthorizedAdminResponse();

  const data = await getAdminRegistrationNotifications();
  return NextResponse.json(createApiResponse(true, { data }));
}
