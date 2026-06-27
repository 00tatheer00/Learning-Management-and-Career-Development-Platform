import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp";
import { getPortalLoginUrl } from "@/lib/site-url";
import { sendOnce } from "@/lib/automation/send-log";
import { sendAdminAutomationAlert } from "@/lib/automation/admin-alert";

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export async function runNeverLoggedInNudges(now = new Date()): Promise<{
  studentNudges: number;
  adminDigestSent: boolean;
}> {
  const cutoff = new Date(now.getTime() - TWO_DAYS_MS);
  const students = await prisma.user.findMany({
    where: {
      role: "student",
      isActive: true,
      firstLoginAt: null,
      createdAt: { lte: cutoff },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      programSlug: true,
      createdAt: true,
    },
  });

  let studentNudges = 0;
  const stillMissing: string[] = [];

  for (const student of students) {
    const key = `never_logged_in:${student.id}`;
    const result = await sendOnce(key, "never_logged_in_nudge", async () => {
      if (!student.phone) return { sent: false };

      const loginUrl = getPortalLoginUrl();
      const message = [
        `Assalam o Alaikum ${student.name.split(" ")[0]},`,
        "",
        "Aapka EEST portal account approve ho chuka hai, lekin abhi tak login nahi hua.",
        "",
        `Login ID: ${student.email}`,
        `Portal: ${loginUrl}`,
        "",
        "Agar password yaad nahi, Portal Logins se WhatsApp par dubara mangwa sakte hain.",
        "",
        "— EEST Team",
      ].join("\n");

      const send = await sendWhatsAppMessage(student.phone, message);
      return { sent: send.sent };
    });

    if (result.sent) {
      studentNudges += 1;
    } else if (!result.skipped) {
      stillMissing.push(`${student.name} (${student.email})`);
    } else {
      stillMissing.push(`${student.name} (${student.email})`);
    }
  }

  let adminDigestSent = false;
  if (stillMissing.length > 0) {
    const dateKey = now.toISOString().slice(0, 10);
    const digestResult = await sendOnce(
      `never_logged_in_admin:${dateKey}`,
      "never_logged_in_admin_digest",
      async () => {
        const lines = stillMissing.slice(0, 20);
        const message = [
          "📋 *Students — No Portal Login Yet*",
          "",
          `${stillMissing.length} student(s) approved 2+ days ago but never logged in:`,
          "",
          ...lines.map((line) => `• ${line}`),
          stillMissing.length > 20 ? `\n…and ${stillMissing.length - 20} more` : "",
          "",
          "Check Admin → Portal Logins → filter No login",
          "",
          "— EEST Portal",
        ]
          .filter(Boolean)
          .join("\n");

        const sent = await sendAdminAutomationAlert(message);
        return { sent };
      }
    );
    adminDigestSent = digestResult.sent;
  }

  return { studentNudges, adminDigestSent };
}
