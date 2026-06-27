import { prisma } from "@/lib/prisma";
import { parseSessionDateTime } from "@/lib/sessions/join-window";
import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp";
import { getPortalLoginUrl } from "@/lib/site-url";
import { sendOnce } from "@/lib/automation/send-log";

const ONE_HOUR_MS = 60 * 60 * 1000;
const FIFTEEN_MIN_MS = 15 * 60 * 1000;
const CRON_WINDOW_MS = 15 * 60 * 1000;

function isInReminderWindow(
  sessionStart: Date,
  now: Date,
  targetMsBeforeStart: number
): boolean {
  const diff = sessionStart.getTime() - now.getTime();
  const windowStart = targetMsBeforeStart - CRON_WINDOW_MS / 2;
  const windowEnd = targetMsBeforeStart + CRON_WINDOW_MS / 2;
  return diff >= windowStart && diff <= windowEnd;
}

async function notifyProgramStudents(
  programSlug: string,
  message: string
): Promise<number> {
  const students = await prisma.user.findMany({
    where: { role: "student", programSlug, isActive: true },
    select: { phone: true },
  });

  let sent = 0;
  for (const student of students) {
    if (!student.phone) continue;
    const result = await sendWhatsAppMessage(student.phone, message);
    if (result.sent) sent += 1;
  }
  return sent;
}

export async function runClassReminders(now = new Date()): Promise<{
  oneHour: number;
  fifteenMin: number;
}> {
  const sessions = await prisma.liveSession.findMany();
  let oneHour = 0;
  let fifteenMin = 0;
  const loginUrl = getPortalLoginUrl();

  for (const session of sessions) {
    const start = parseSessionDateTime(session.date, session.time);
    if (!start || start.getTime() <= now.getTime()) continue;

    if (isInReminderWindow(start, now, ONE_HOUR_MS)) {
      const key = `class_reminder_1h:${session.id}`;
      const result = await sendOnce(key, "class_reminder_1h", async () => {
        const message = [
          "⏰ *Class Reminder — 1 hour*",
          "",
          `Class: ${session.title}`,
          `Date: ${session.date}`,
          `Time: ${session.time}`,
          `Trainer: ${session.trainerName}`,
          "",
          `Join from portal: ${loginUrl}`,
          "",
          "— EEST Team",
        ].join("\n");
        const count = await notifyProgramStudents(session.programSlug, message);
        return { sent: count > 0 };
      });
      if (result.sent) oneHour += 1;
    }

    if (isInReminderWindow(start, now, FIFTEEN_MIN_MS)) {
      const key = `class_reminder_15m:${session.id}`;
      const result = await sendOnce(key, "class_reminder_15m", async () => {
        const message = [
          "🔔 *Class Starting in 15 Minutes*",
          "",
          `Class: ${session.title}`,
          `Time: ${session.time}`,
          "",
          `Open portal & tap Join Class: ${loginUrl}`,
          "",
          "— EEST Team",
        ].join("\n");
        const count = await notifyProgramStudents(session.programSlug, message);
        return { sent: count > 0 };
      });
      if (result.sent) fifteenMin += 1;
    }
  }

  return { oneHour, fifteenMin };
}
