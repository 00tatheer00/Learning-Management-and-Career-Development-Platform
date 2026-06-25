import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export async function rotateActiveSession(userId: string): Promise<string> {
  const sessionId = randomUUID();
  await prisma.user.update({
    where: { id: userId },
    data: { activeSessionId: sessionId },
  });
  return sessionId;
}

export async function recordUserLogin(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstLoginAt: true },
  });
  if (!user) return;

  const now = new Date();
  await prisma.user.update({
    where: { id: userId },
    data: {
      lastLoginAt: now,
      ...(user.firstLoginAt ? {} : { firstLoginAt: now }),
    },
  });
}

export async function clearActiveSession(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { activeSessionId: null },
  });
}

export async function isActiveSession(
  userId: string,
  sessionId: string | undefined | null
): Promise<boolean> {
  if (!sessionId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { activeSessionId: true, isActive: true, role: true },
  });

  if (!user?.isActive) return false;
  if (user.role !== "student") return true;
  return user.activeSessionId === sessionId;
}
