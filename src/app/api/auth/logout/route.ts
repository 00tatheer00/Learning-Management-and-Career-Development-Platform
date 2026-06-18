import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";

export async function POST() {
  await destroySession();
  return NextResponse.json(createApiResponse(true, { message: "Logged out" }));
}
