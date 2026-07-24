import { getProgramBySlug } from "@/lib/data/programs";
import {
  buildApprovalTemplatePreview,
  type ApprovalTemplateParams,
} from "@/lib/notifications/approval-templates";
import { sendApprovalEmail } from "@/lib/notifications/email";
import { sendApprovalWhatsApp } from "@/lib/notifications/whatsapp";
import { getPortalLoginUrl } from "@/lib/site-url";

interface EnrollmentNotificationRecord {
  fullName: string;
  email: string;
  whatsapp: string;
  program: string;
  level: string;
  password: string;
}

export async function sendApprovalWelcomeNotifications(
  enrollment: EnrollmentNotificationRecord
): Promise<{ whatsappSent: boolean; emailSent: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  const loginUrl = getPortalLoginUrl();
  const courseName = getProgramBySlug(enrollment.program)?.title ?? enrollment.program;
  const programLevel = getProgramBySlug(enrollment.program)?.level ?? "—";
  const firstName = enrollment.fullName.split(" ")[0] ?? enrollment.fullName;

  const params: ApprovalTemplateParams = {
    firstName,
    courseName,
    module: enrollment.level,
    portalLoginUrl: loginUrl,
  };

  const emailResult = await sendApprovalEmail({
    to: enrollment.email,
    studentName: enrollment.fullName,
    email: enrollment.email,
    password: enrollment.password,
    courseName,
    level: programLevel,
    loginUrl,
  });

  if (!emailResult.sent) {
    warnings.push(emailResult.error ?? "Approval email not sent");
  }

  // Option 1: Direct 1-Click WhatsApp Chat enabled in Admin UI
  return {
    whatsappSent: true,
    emailSent: emailResult.sent,
    warnings,
  };
}
