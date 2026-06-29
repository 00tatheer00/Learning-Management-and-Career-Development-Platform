import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getPortalHome } from "@/lib/auth/portal-routes";
import { isAdminRole } from "@/lib/auth/admin-roles";
import type { UserRole } from "@/types/portal";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (!token?.role) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = token.role as UserRole;

    if (pathname.startsWith("/admin") && !isAdminRole(role)) {
      return NextResponse.redirect(new URL(getPortalHome(role), req.url));
    }
    if (pathname.startsWith("/trainer") && role !== "trainer") {
      return NextResponse.redirect(new URL(getPortalHome(role), req.url));
    }
    if (pathname.startsWith("/student") && role !== "student") {
      return NextResponse.redirect(new URL(getPortalHome(role), req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/student/:path*", "/trainer/:path*", "/admin/:path*"],
};
