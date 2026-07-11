import "server-only";

import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth/auth-options";
import { isActiveSession } from "@/lib/auth/session-control";
import { getPortalHome } from "@/lib/auth/portal-routes";
import { prisma } from "@/lib/prisma";
import type { PortalUser, UserRole } from "@/types/portal";
import { syncStudentActiveModuleFromEnrollments } from "@/lib/auth/student-module-sync";

export { getPortalHome };

function getAuthSecret(): string | null {
  return process.env.NEXTAUTH_SECRET?.trim() ?? process.env.AUTH_SECRET?.trim() ?? null;
}

async function readSessionIdentity(request?: Request): Promise<{
  userId: string;
  sessionId?: string;
} | null> {
  const secret = getAuthSecret();
  if (!secret) return null;

  const secureCookie = process.env.NODE_ENV === "production";

  if (request) {
    const token = await getToken({
      req: request as NextRequest,
      secret,
      secureCookie,
    });
    if (token?.id && !token.sessionInvalid) {
      return {
        userId: token.id as string,
        sessionId: token.sessionId as string | undefined,
      };
    }
  }

  try {
    const cookieStore = await cookies();
    const token = await getToken({
      req: {
        cookies: Object.fromEntries(cookieStore.getAll().map((entry) => [entry.name, entry.value])),
      } as unknown as NextRequest,
      secret,
      secureCookie,
    });
    if (token?.id && !token.sessionInvalid) {
      return {
        userId: token.id as string,
        sessionId: token.sessionId as string | undefined,
      };
    }
  } catch {
    // cookies() may be unavailable outside a request scope
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.sessionInvalid) return null;

  return {
    userId: session.user.id,
    sessionId: session.sessionId,
  };
}

async function buildPortalUser(
  userId: string,
  sessionId?: string
): Promise<PortalUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.isActive) return null;

  if (user.role === "student") {
    const sessionValid = await isActiveSession(user.id, sessionId);
    if (!sessionValid) return null;
  }

  const level =
    user.role === "student" && user.programSlug
      ? (await syncStudentActiveModuleFromEnrollments(user.id)) ?? user.level
      : user.level;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone ?? undefined,
    programSlug: user.programSlug ?? undefined,
    level: level ?? undefined,
    trainerId: user.trainerId ?? undefined,
    avatarInitials: user.avatarInitials ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

export async function getCurrentUser(request?: Request): Promise<PortalUser | null> {
  const identity = await readSessionIdentity(request);
  if (!identity) return null;
  return buildPortalUser(identity.userId, identity.sessionId);
}

export function roleGuard(user: PortalUser | null, allowed: UserRole[]): PortalUser {
  if (!user || !allowed.includes(user.role)) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(allowed: UserRole[], request?: Request): Promise<PortalUser> {
  const user = await getCurrentUser(request);
  return roleGuard(user, allowed);
}
