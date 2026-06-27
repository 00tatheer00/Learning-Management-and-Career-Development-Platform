import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp";
import { getPortalLoginUrl } from "@/lib/site-url";
import { sendOnce } from "@/lib/automation/send-log";

function getTomorrowDateString(now = new Date()): string {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const y = tomorrow.getFullYear();
  const m = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const d = String(tomorrow.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function runAssignmentDueReminders(now = new Date()): Promise<number> {
  const tomorrow = getTomorrowDateString(now);
  const assignments = await prisma.assignment.findMany({
    where: { dueDate: tomorrow },
  });

  if (assignments.length === 0) return 0;

  let sentCount = 0;
  const loginUrl = getPortalLoginUrl();

  for (const assignment of assignments) {
    const students = await prisma.user.findMany({
      where: {
        role: "student",
        programSlug: assignment.programSlug,
        isActive: true,
      },
      select: { id: true, name: true, phone: true },
    });

    if (students.length === 0) continue;

    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        assignmentId: assignment.id,
        studentId: { in: students.map((s) => s.id) },
      },
      select: { studentId: true },
    });
    const submittedIds = new Set(submissions.map((s) => s.studentId));

    for (const student of students) {
      if (submittedIds.has(student.id) || !student.phone) continue;

      const key = `assignment_due:${assignment.id}:${student.id}`;
      const result = await sendOnce(key, "assignment_due_reminder", async () => {
        const message = [
          `Hi ${student.name.split(" ")[0]},`,
          "",
          `📝 *Assignment Due Tomorrow*`,
          "",
          `Title: ${assignment.title}`,
          `Due: ${assignment.dueDate}`,
          "",
          `Submit from portal: ${loginUrl}`,
          "",
          "— EEST Team",
        ].join("\n");

        const send = await sendWhatsAppMessage(student.phone!, message);
        return { sent: send.sent };
      });

      if (result.sent) sentCount += 1;
    }
  }

  return sentCount;
}
