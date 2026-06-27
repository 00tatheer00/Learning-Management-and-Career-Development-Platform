import { prisma } from "@/lib/prisma";

export async function recordUserActivity(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { lastActiveAt: new Date() },
  });
}
