import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp";
import { sendOnce } from "@/lib/automation/send-log";
import { sendAdminAutomationAlert } from "@/lib/automation/admin-alert";
import { getProgramBySlug } from "@/lib/data/programs";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function getLastActiveAt(student: {
  lastActiveAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
}): Date {
  return student.lastActiveAt ?? student.lastLoginAt ?? student.createdAt;
}

export async function runInactiveStudentAlerts(now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - SEVEN_DAYS_MS);
  const students = await prisma.user.findMany({
    where: { role: "student", isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      programSlug: true,
      trainerId: true,
      lastActiveAt: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  let alertsSent = 0;

  for (const student of students) {
    const lastActive = getLastActiveAt(student);
    if (lastActive.getTime() > cutoff.getTime()) continue;

    const courseName =
      getProgramBySlug(student.programSlug ?? "")?.title ?? student.programSlug ?? "Course";

    const key = `inactive_alert:${student.id}`;
    const result = await sendOnce(key, "inactive_student_alert", async () => {
      const message = [
        "⚠️ *Inactive Student Alert*",
        "",
        `Student: ${student.name}`,
        `Email: ${student.email}`,
        `Course: ${courseName}`,
        `Last active: ${lastActive.toISOString().slice(0, 10)}`,
        "",
        "No portal activity for 7+ days — consider a follow-up.",
        "",
        "— EEST Portal",
      ].join("\n");

      const adminSent = await sendAdminAutomationAlert(message);

      let trainerSent = false;
      if (student.trainerId) {
        const trainer = await prisma.user.findUnique({
          where: { id: student.trainerId },
          select: { phone: true, name: true },
        });
        if (trainer?.phone) {
          const trainerResult = await sendWhatsAppMessage(trainer.phone, message);
          trainerSent = trainerResult.sent;
        }
      }

      return { sent: adminSent || trainerSent };
    });

    if (result.sent) alertsSent += 1;
  }

  return alertsSent;
}
