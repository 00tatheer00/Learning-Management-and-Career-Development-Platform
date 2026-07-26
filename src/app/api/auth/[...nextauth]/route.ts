import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/auth-options";
import { rateLimitByIp } from "@/lib/security/rate-limit";

const nextAuthHandler = NextAuth(authOptions);

export async function GET(request: Request, context: unknown) {
  return nextAuthHandler(request, context as Parameters<typeof nextAuthHandler>[1]);
}

export async function POST(request: Request, context: unknown) {
  const url = new URL(request.url);
  // Rate limit credential login / signin requests (5 attempts per minute per IP)
  if (
    url.pathname.includes("/callback/credentials") ||
    url.pathname.includes("/signin/credentials")
  ) {
    const isLimited = await rateLimitByIp(request, "auth-login", 5, 60);
    if (isLimited) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 1 minute before trying again." },
        { status: 429 }
      );
    }
  }

  return nextAuthHandler(request, context as Parameters<typeof nextAuthHandler>[1]);
}
