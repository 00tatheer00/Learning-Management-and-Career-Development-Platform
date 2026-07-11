import { getDemoStudentRecipient } from "@/lib/notifications/student-email-audience";
import { sendClassReminderEmail } from "@/lib/notifications/class-reminder-email";
import { sendNewAssignmentEmail } from "@/lib/notifications/assignment-new-email";
import {
  sampleClassReminderEmailParams,
  sampleNewAssignmentEmailParams,
} from "@/lib/notifications/student-notification-templates";

export async function sendDemoStudentSampleEmails(): Promise<{
  demoEmail: string;
  classReminder: { sent: boolean; error?: string };
  newAssignment: { sent: boolean; error?: string };
}> {
  const recipient = await getDemoStudentRecipient();

  const classParams = {
    ...sampleClassReminderEmailParams(),
    studentName: recipient.name,
  };
  const assignmentParams = {
    ...sampleNewAssignmentEmailParams(),
    studentName: recipient.name,
  };

  const [classReminder, newAssignment] = await Promise.all([
    sendClassReminderEmail(recipient.email, classParams),
    sendNewAssignmentEmail(recipient.email, {
      studentName: recipient.name,
      courseName: assignmentParams.courseName,
      moduleName: assignmentParams.moduleName,
      assignmentTitle: assignmentParams.assignmentTitle,
      description: assignmentParams.description,
      dueDate: assignmentParams.dueDate,
    }),
  ]);

  return {
    demoEmail: recipient.email,
    classReminder,
    newAssignment,
  };
}
