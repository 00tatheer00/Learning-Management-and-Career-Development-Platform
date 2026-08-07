import { prisma } from "@/lib/prisma";

/** Create today's live session rows from the fixed weekly class schedule (if missing). */
/** Purge auto-generated dummy sessions so trainers create all live classes manually. */
export async function ensureScheduledLiveSessions(now?: Date): Promise<{
  created: number;
  skipped: number;
}> {
  void now;
  try {
    // Delete any previously auto-generated dummy sessions so trainer creates classes manually
    await prisma.liveSession.deleteMany({
      where: {
        id: { startsWith: "scheduled-" },
      },
    });
  } catch (error) {
    console.error("[ensure-scheduled-sessions] Purge auto sessions failed:", error);
  }

  return { created: 0, skipped: 0 };
}
