import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { isActiveSession } from "@/lib/auth/session-control";
import { getPortalHome } from "@/lib/auth/portal-routes";
import { prisma } from "@/lib/prisma";
import type { PortalUser, UserRole } from "@/types/portal";

export { getPortalHome };

export async function getCurrentUser(): Promise<PortalUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.sessionInvalid) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !user.isActive) return null;

  if (user.role === "student") {
    const sessionValid = await isActiveSession(user.id, session.sessionId);
    if (!sessionValid) return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone ?? undefined,
    programSlug: user.programSlug ?? undefined,
    level: user.level ?? undefined,
    trainerId: user.trainerId ?? undefined,
    avatarInitials: user.avatarInitials ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

export function roleGuard(user: PortalUser | null, allowed: UserRole[]): PortalUser {
  if (!user || !allowed.includes(user.role)) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(allowed: UserRole[]): Promise<PortalUser> {
  const user = await getCurrentUser();
  return roleGuard(user, allowed);
}
