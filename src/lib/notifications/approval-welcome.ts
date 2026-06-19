import { decryptSecret } from "@/lib/crypto/secret";
import { getProgramBySlug } from "@/lib/data/programs";
import { sendApprovalEmail } from "@/lib/notifications/email";
import {
  buildApprovalWhatsAppMessage,
} from "@/lib/notifications/approval-templates";
import { sendApprovalWhatsApp } from "@/lib/notifications/whatsapp";
import { getPortalLoginUrl } from "@/lib/site-url";
import { clearEnrollmentPortalPasswordEnc } from "@/lib/api/portal-data";

interface EnrollmentNotificationRecord {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  program: string;
  level: string;
  cnic: string;
  portalPasswordEnc?: string | null;
}

export async function sendApprovalWelcomeNotifications(
  enrollment: EnrollmentNotificationRecord
): Promise<{ emailSent: boolean; whatsappSent: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  const loginUrl = getPortalLoginUrl();
  const courseName = getProgramBySlug(enrollment.program)?.title ?? enrollment.program;

  const password =
    (enrollment.portalPasswordEnc ? decryptSecret(enrollment.portalPasswordEnc) : null) ??
    enrollment.cnic.slice(-6);

  const emailResult = await sendApprovalEmail({
    to: enrollment.email,
    studentName: enrollment.fullName,
    email: enrollment.email,
    password,
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
    password,
    courseName,
    level: enrollment.level,
    loginUrl,
  });

  const whatsappResult = await sendApprovalWhatsApp(enrollment.whatsapp, whatsappMessage);
  if (!whatsappResult.sent) {
    warnings.push(whatsappResult.error ?? "WhatsApp not sent");
  }

  if (emailResult.sent || whatsappResult.sent) {
    await clearEnrollmentPortalPasswordEnc(enrollment.id);
  }

  return {
    emailSent: emailResult.sent,
    whatsappSent: whatsappResult.sent,
    warnings,
  };
}
