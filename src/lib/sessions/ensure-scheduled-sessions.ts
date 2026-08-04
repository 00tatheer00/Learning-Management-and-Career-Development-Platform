import { prisma } from "@/lib/prisma";
import { PROGRAM_CLASS_CONFIG } from "@/lib/class-schedule/config";
import { getProgramBySlug } from "@/lib/data/programs";
import { getFirstModuleName } from "@/lib/modules/student-module-access";
import {
  buildLiveSessionTimestamps,
  DEFAULT_SESSION_TIMEZONE,
} from "@/lib/sessions/live-session-datetime";

function getPakistanDay(now: Date): { date: string; dayOfWeek: number } {
  const date = now.toLocaleDateString("en-CA", { timeZone: DEFAULT_SESSION_TIMEZONE });
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: DEFAULT_SESSION_TIMEZONE,
    weekday: "short",
  }).format(now);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return { date, dayOfWeek: map[weekday] ?? 0 };
}

/** Create today's live session rows from the fixed weekly class schedule (if missing). */
/** Purge auto-generated dummy sessions so trainers create all live classes manually. */
export async function ensureScheduledLiveSessions(_now?: Date): Promise<{
  created: number;
  skipped: number;
}> {
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
