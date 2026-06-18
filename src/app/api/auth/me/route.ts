import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(createApiResponse(false, { error: "Not logged in" }), {
      status: 401,
    });
  }
  return NextResponse.json(createApiResponse(true, { data: user }));
}
