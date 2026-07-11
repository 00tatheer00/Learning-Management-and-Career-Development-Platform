import { getProgramBySlug } from "@/lib/data/programs";
import { getPortalLoginUrl } from "@/lib/site-url";
import {
  emailButton,
  emailInfoBox,
  wrapStudentEmailHtml,
} from "@/lib/notifications/student-email-layout";

export interface ClassReminderEmailParams {
  studentName: string;
  courseName: string;
  moduleName: string;
  classTitle: string;
  classDate: string;
  classTime: string;
  trainerName: string;
  joinUrl?: string;
}

export interface NewAssignmentEmailParams {
  studentName: string;
  courseName: string;
  moduleName: string;
  assignmentTitle: string;
  description: string;
  dueDate: string;
  assignmentsUrl?: string;
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function buildClassReminderEmailHtml(params: ClassReminderEmailParams): string {
  const joinUrl = params.joinUrl ?? `${getPortalLoginUrl()}/student/classes`;
  const name = firstName(params.studentName);

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
      Hi ${name}, your live class starts in about <strong>30 minutes</strong>. Join on time from the student portal.
    </p>
    ${emailInfoBox("Class details", [
      { label: "Course", value: params.courseName },
      { label: "Module", value: params.moduleName },
      { label: "Class", value: params.classTitle },
      { label: "Date", value: params.classDate },
      { label: "Time", value: params.classTime },
      { label: "Trainer", value: params.trainerName },
    ])}
    <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">
      The <strong>Join Class</strong> button opens 10 minutes before the scheduled time. Keep your portal login ready.
    </p>
    ${emailButton(joinUrl, "Open Live Classes", "#2563eb")}
  `;

  return wrapStudentEmailHtml({
    preheader: `${params.classTitle} starts in 30 minutes`,
    heroLabel: "Live Class Reminder",
    heroTitle: "Class starts in 30 minutes ⏰",
    heroGradient: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
    bodyHtml,
  });
}

export function buildClassReminderEmailText(params: ClassReminderEmailParams): string {
  const joinUrl = params.joinUrl ?? `${getPortalLoginUrl()}/student/classes`;
  const name = firstName(params.studentName);

  return [
    `Hi ${name},`,
    "",
    "Your live class starts in about 30 minutes.",
    "",
    `Course: ${params.courseName}`,
    `Module: ${params.moduleName}`,
    `Class: ${params.classTitle}`,
    `Date: ${params.classDate}`,
    `Time: ${params.classTime}`,
    `Trainer: ${params.trainerName}`,
    "",
    `Open Live Classes: ${joinUrl}`,
    "",
    "— EEST Team",
  ].join("\n");
}

export function buildNewAssignmentEmailHtml(params: NewAssignmentEmailParams): string {
  const assignmentsUrl = params.assignmentsUrl ?? `${getPortalLoginUrl()}/student/assignments`;
  const name = firstName(params.studentName);

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
      Hi ${name}, your trainer posted a new assignment for <strong>${params.moduleName}</strong>.
    </p>
    ${emailInfoBox("Assignment details", [
      { label: "Course", value: params.courseName },
      { label: "Module", value: params.moduleName },
      { label: "Title", value: params.assignmentTitle },
      { label: "Due date", value: params.dueDate },
    ])}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;margin:0 0 20px;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#c2410c;">Instructions</p>
          <p style="margin:0;font-size:15px;line-height:1.7;color:#374151;white-space:pre-wrap;">${params.description}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">
      Open the portal, read the task carefully, and submit your answer before the due date.
    </p>
    ${emailButton(assignmentsUrl, "View Assignment", "#ea580c")}
  `;

  return wrapStudentEmailHtml({
    preheader: `New assignment: ${params.assignmentTitle}`,
    heroLabel: "New Assignment",
    heroTitle: "New homework posted 📝",
    heroGradient: "linear-gradient(135deg,#ea580c,#f97316)",
    bodyHtml,
  });
}

export function buildNewAssignmentEmailText(params: NewAssignmentEmailParams): string {
  const assignmentsUrl = params.assignmentsUrl ?? `${getPortalLoginUrl()}/student/assignments`;
  const name = firstName(params.studentName);

  return [
    `Hi ${name},`,
    "",
    "Your trainer posted a new assignment.",
    "",
    `Course: ${params.courseName}`,
    `Module: ${params.moduleName}`,
    `Title: ${params.assignmentTitle}`,
    `Due date: ${params.dueDate}`,
    "",
    "Instructions:",
    params.description,
    "",
    `Open assignments: ${assignmentsUrl}`,
    "",
    "— EEST Team",
  ].join("\n");
}

export function sampleClassReminderEmailParams(
  programSlug = "web-development"
): ClassReminderEmailParams {
  const course = getProgramBySlug(programSlug);
  return {
    studentName: "Demo Student",
    courseName: course?.title ?? "Web Development",
    moduleName: course?.modules[0]?.name ?? "HTML & CSS",
    classTitle: "Introduction to HTML & CSS — Live Session",
    classDate: "Monday, 14 July 2026",
    classTime: "7:00 PM (PKT)",
    trainerName: "Trainer",
  };
}

export function sampleNewAssignmentEmailParams(
  programSlug = "web-development"
): NewAssignmentEmailParams {
  const course = getProgramBySlug(programSlug);
  return {
    studentName: "Demo Student",
    courseName: course?.title ?? "Web Development",
    moduleName: course?.modules[0]?.name ?? "HTML & CSS",
    assignmentTitle: "Build a responsive landing page",
    description:
      "Create a single-page landing page using HTML and CSS.\n\nRequirements:\n• Header with logo and navigation\n• Hero section with CTA button\n• At least 3 feature cards\n• Mobile-friendly layout\n\nSubmit your CodePen or GitHub link in the portal.",
    dueDate: "2026-07-20",
  };
}
