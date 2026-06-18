import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/student", "/trainer", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("eest_session");

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/trainer/:path*", "/admin/:path*"],
};
