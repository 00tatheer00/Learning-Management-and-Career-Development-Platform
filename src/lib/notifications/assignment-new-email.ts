import { getProgramBySlug } from "@/lib/data/programs";
import { resolveContentModuleLevel } from "@/lib/modules/student-module-content";
import type { Assignment } from "@/types/portal";
import {
  buildNewAssignmentEmailHtml,
  buildNewAssignmentEmailText,
} from "@/lib/notifications/student-notification-templates";
import { sendStudentNotificationEmail } from "@/lib/notifications/send-student-email";
import { getEligibleStudentEmailRecipients } from "@/lib/notifications/student-email-audience";

export async function sendNewAssignmentEmail(
  to: string,
  params: {
    studentName: string;
    courseName: string;
    moduleName: string;
    assignmentTitle: string;
    description: string;
    dueDate: string;
  }
): Promise<{ sent: boolean; error?: string }> {
  return sendStudentNotificationEmail({
    to,
    subject: `New assignment: ${params.assignmentTitle}`,
    html: buildNewAssignmentEmailHtml(params),
    text: buildNewAssignmentEmailText(params),
  });
}

export async function notifyStudentsOfNewAssignment(
  assignment: Pick<Assignment, "programSlug" | "level" | "title" | "description" | "dueDate">
): Promise<{ sent: number; failed: number; recipients: string[]; errors: string[] }> {
  const course = getProgramBySlug(assignment.programSlug);
  const moduleName =
    resolveContentModuleLevel(assignment.programSlug, assignment.level) ??
    assignment.level ??
    "—";

  const recipients = await getEligibleStudentEmailRecipients({
    programSlug: assignment.programSlug,
    moduleLevel: assignment.level,
  });

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];
  const sentTo: string[] = [];

  for (const recipient of recipients) {
    const result = await sendNewAssignmentEmail(recipient.email, {
      studentName: recipient.name,
      courseName: course?.title ?? assignment.programSlug,
      moduleName,
      assignmentTitle: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
    });

    if (result.sent) {
      sent += 1;
      sentTo.push(recipient.email);
    } else {
      failed += 1;
      if (result.error) errors.push(result.error);
    }
  }

  return { sent, failed, recipients: sentTo, errors };
}
