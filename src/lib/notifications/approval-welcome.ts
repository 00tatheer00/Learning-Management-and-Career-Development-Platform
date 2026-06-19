import { getProgramBySlug } from "@/lib/data/programs";
import { sendApprovalEmail } from "@/lib/notifications/email";
import { buildApprovalWhatsAppMessage } from "@/lib/notifications/approval-templates";
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
): Promise<{ emailSent: boolean; whatsappSent: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  const loginUrl = getPortalLoginUrl();
  const courseName = getProgramBySlug(enrollment.program)?.title ?? enrollment.program;

  const emailResult = await sendApprovalEmail({
    to: enrollment.email,
    studentName: enrollment.fullName,
    email: enrollment.email,
    password: enrollment.password,
    courseName,
    level: enrollment.level,
    loginUrl,
  });

  if (!emailResult.sent) {
    warnings.push(emailResult.error ?? "Email not sent");
  }

  const whatsappMessage = buildApprovalWhatsAppMessage({
    studentName: enrollment.fullName,
    email: enrollment.email,
    password: enrollment.password,
    courseName,
    level: enrollment.level,
    loginUrl,
  });

  const whatsappResult = await sendApprovalWhatsApp(enrollment.whatsapp, whatsappMessage);
  if (!whatsappResult.sent) {
    warnings.push(whatsappResult.error ?? "WhatsApp not sent");
  }

  return {
    emailSent: emailResult.sent,
    whatsappSent: whatsappResult.sent,
    warnings,
  };
}
