import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp";
import { getPortalLoginUrl } from "@/lib/site-url";

interface LiveClassNoticeInput {
  programSlug: string;
  title: string;
  date: string;
  time: string;
  trainerName: string;
}

export async function notifyStudentsOfLiveClass(input: LiveClassNoticeInput): Promise<void> {
  const students = await prisma.user.findMany({
    where: {
      role: "student",
      programSlug: input.programSlug,
      isActive: true,
    },
    select: { name: true, phone: true },
  });

  if (students.length === 0) return;

  const loginUrl = getPortalLoginUrl();
  const message = [
    "📅 *New Live Class Scheduled*",
    "",
    `Class: ${input.title}`,
    `Date: ${input.date}`,
    `Time: ${input.time}`,
    `Trainer: ${input.trainerName}`,
    "",
    `Join from your portal: ${loginUrl}`,
    "",
    "Open Live Classes → tap Join Class to enter Google Meet.",
    "",
    "— EEST Team",
  ].join("\n");

  for (const student of students) {
    if (student.phone) {
      void sendWhatsAppMessage(student.phone, message);
    }
  }
}
