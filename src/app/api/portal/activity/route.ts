import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { recordUserActivity } from "@/lib/auth/user-activity";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 401,
    });
  }

  await recordUserActivity(user.id);
  return NextResponse.json(createApiResponse(true, { message: "Activity recorded" }));
}
