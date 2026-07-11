import { getProgramBySlug } from "@/lib/data/programs";
import { resolveContentModuleLevel } from "@/lib/modules/student-module-content";
import { getPortalLoginUrl } from "@/lib/site-url";
import {
  buildClassReminderEmailHtml,
  buildClassReminderEmailText,
  type ClassReminderEmailParams,
} from "@/lib/notifications/student-notification-templates";
import { sendStudentNotificationEmail } from "@/lib/notifications/send-student-email";

export async function sendClassReminderEmail(
  to: string,
  params: ClassReminderEmailParams
): Promise<{ sent: boolean; error?: string }> {
  return sendStudentNotificationEmail({
    to,
    subject: `Reminder: ${params.classTitle} starts in 30 minutes`,
    html: buildClassReminderEmailHtml(params),
    text: buildClassReminderEmailText(params),
  });
}

export function buildClassReminderParams(input: {
  studentName: string;
  programSlug: string;
  sessionLevel?: string | null;
  classTitle: string;
  classDate: string;
  classTime: string;
  trainerName: string;
}): ClassReminderEmailParams {
  const course = getProgramBySlug(input.programSlug);
  return {
    studentName: input.studentName,
    courseName: course?.title ?? input.programSlug,
    moduleName:
      resolveContentModuleLevel(input.programSlug, input.sessionLevel) ?? input.sessionLevel ?? "—",
    classTitle: input.classTitle,
    classDate: input.classDate,
    classTime: input.classTime,
    trainerName: input.trainerName,
    joinUrl: `${getPortalLoginUrl()}/student/classes`,
  };
}
