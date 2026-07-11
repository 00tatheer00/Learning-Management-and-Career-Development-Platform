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
export async function ensureScheduledLiveSessions(now = new Date()): Promise<{
  created: number;
  skipped: number;
}> {
  const { date, dayOfWeek } = getPakistanDay(now);
  let created = 0;
  let skipped = 0;

  for (const programSlug of Object.keys(PROGRAM_CLASS_CONFIG) as Array<
    keyof typeof PROGRAM_CLASS_CONFIG
  >) {
    const config = PROGRAM_CLASS_CONFIG[programSlug];
    if (date < config.startDate || !config.classDays.includes(dayOfWeek)) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.liveSession.findFirst({
      where: { programSlug, date },
      select: { id: true },
    });
    if (existing) {
      skipped += 1;
      continue;
    }

    const trainer = await prisma.user.findFirst({
      where: { role: "trainer", programSlug, isActive: true },
      select: { id: true, name: true, level: true },
    });
    if (!trainer) {
      skipped += 1;
      continue;
    }

    const timestamps = buildLiveSessionTimestamps(date, config.startTime);
    if (!timestamps) {
      skipped += 1;
      continue;
    }

    const program = getProgramBySlug(programSlug);
    const sessionId = `scheduled-${programSlug}-${date}`;

    try {
      await prisma.liveSession.create({
        data: {
          id: sessionId,
          programSlug,
          level: trainer.level ?? getFirstModuleName(programSlug),
          title: `${program?.title ?? programSlug} — Live Class`,
          startsAt: timestamps.startsAt,
          timezone: timestamps.timezone,
          date: timestamps.date,
          time: timestamps.time,
          meetLink: "",
          roomType: "meet",
          trainerId: trainer.id,
          trainerName: trainer.name,
          notes: "Your trainer will add the Google Meet link before class. Join opens 10 minutes before start.",
        },
      });
      created += 1;
    } catch (error) {
      console.error(`[ensure-scheduled-sessions] ${programSlug} ${date}:`, error);
      skipped += 1;
    }
  }

  return { created, skipped };
}
