import { prisma } from "@/lib/prisma";
import { parseSessionDateTime } from "@/lib/sessions/join-window";
import { sendOnce } from "@/lib/automation/send-log";
import { getEligibleStudentEmailRecipients } from "@/lib/notifications/student-email-audience";
import {
  buildClassReminderParams,
  sendClassReminderEmail,
} from "@/lib/notifications/class-reminder-email";

const THIRTY_MIN_MS = 30 * 60 * 1000;
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

export async function runClassReminders(now = new Date()): Promise<{ thirtyMin: number }> {
  const sessions = await prisma.liveSession.findMany();
  let thirtyMin = 0;

  for (const session of sessions) {
    const start = parseSessionDateTime(session.date, session.time);
    if (!start || start.getTime() <= now.getTime()) continue;

    if (!isInReminderWindow(start, now, THIRTY_MIN_MS)) continue;

    const key = `class_reminder_30m:${session.id}`;
    const result = await sendOnce(key, "class_reminder_30m", async () => {
      const recipients = await getEligibleStudentEmailRecipients({
        programSlug: session.programSlug,
        moduleLevel: session.level,
      });

      let sentCount = 0;
      for (const recipient of recipients) {
        const params = buildClassReminderParams({
          studentName: recipient.name,
          programSlug: session.programSlug,
          sessionLevel: session.level,
          classTitle: session.title,
          classDate: session.date,
          classTime: session.time,
          trainerName: session.trainerName,
        });
        const emailResult = await sendClassReminderEmail(recipient.email, params);
        if (emailResult.sent) sentCount += 1;
      }

      return { sent: sentCount > 0 };
    });

    if (result.sent) thirtyMin += 1;
  }

  return { thirtyMin };
}
