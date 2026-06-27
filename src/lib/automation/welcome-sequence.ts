import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp";
import { getPortalLoginUrl } from "@/lib/site-url";
import { sendOnce } from "@/lib/automation/send-log";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const WINDOW_MS = 12 * 60 * 60 * 1000;

function isInDayWindow(createdAt: Date, now: Date, targetDayMs: number): boolean {
  const elapsed = now.getTime() - createdAt.getTime();
  return elapsed >= targetDayMs && elapsed <= targetDayMs + WINDOW_MS;
}

export async function runWelcomeSequence(now = new Date()): Promise<{
  day1: number;
  day3: number;
}> {
  const students = await prisma.user.findMany({
    where: { role: "student", isActive: true },
    select: {
      id: true,
      name: true,
      phone: true,
      createdAt: true,
    },
  });

  let day1 = 0;
  let day3 = 0;
  const loginUrl = getPortalLoginUrl();

  for (const student of students) {
    if (!student.phone) continue;

    if (isInDayWindow(student.createdAt, now, ONE_DAY_MS)) {
      const key = `welcome_day1:${student.id}`;
      const result = await sendOnce(key, "welcome_day1", async () => {
        const message = [
          `Hi ${student.name.split(" ")[0]} 👋`,
          "",
          "*Day 1 — Explore Your Course*",
          "",
          "Portal mein login karke *My Course* section kholo — wahan videos aur lessons milenge.",
          "",
          `Portal: ${loginUrl}`,
          "",
          "— EEST Team",
        ].join("\n");
        const send = await sendWhatsAppMessage(student.phone!, message);
        return { sent: send.sent };
      });
      if (result.sent) day1 += 1;
    }

    if (isInDayWindow(student.createdAt, now, THREE_DAYS_MS)) {
      const key = `welcome_day3:${student.id}`;
      const result = await sendOnce(key, "welcome_day3", async () => {
        const message = [
          `Hi ${student.name.split(" ")[0]},`,
          "",
          "*Day 3 — First Assignment*",
          "",
          "Portal → *Assignments* section check karo. Pehla homework wahan submit hota hai.",
          "",
          "Deadline se pehle submit karna mat bhoolna!",
          "",
          `Portal: ${loginUrl}`,
          "",
          "— EEST Team",
        ].join("\n");
        const send = await sendWhatsAppMessage(student.phone!, message);
        return { sent: send.sent };
      });
      if (result.sent) day3 += 1;
    }
  }

  return { day1, day3 };
}
