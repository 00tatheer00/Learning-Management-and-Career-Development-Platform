import { enqueueApprovalEmail } from "@/lib/notifications/email-handlers";
import { sendApprovalWhatsAppNotification } from "@/lib/notifications/ultramsg";

interface EnrollmentNotificationRecord {
  fullName: string;
  email: string;
  whatsapp?: string;
  program: string;
  level: string;
  password: string;
}

export async function sendApprovalWelcomeNotifications(
  enrollment: EnrollmentNotificationRecord
): Promise<{ emailSent: boolean; whatsappSent: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  let emailSent = false;
  let whatsappSent = false;

  // 1. Dispatch Email (with credentials & portal link)
  try {
    enqueueApprovalEmail({
      email: enrollment.email,
      fullName: enrollment.fullName,
      password: enrollment.password,
      program: enrollment.program,
    });
    emailSent = true;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Failed to queue approval email";
    warnings.push(`Email error: ${errorMsg}`);
  }

  // 2. Dispatch Zero-Link WhatsApp Notification via UltraMsg
  if (enrollment.whatsapp && enrollment.whatsapp.trim()) {
    try {
      const waResult = await sendApprovalWhatsAppNotification({
        fullName: enrollment.fullName,
        whatsapp: enrollment.whatsapp,
        program: enrollment.program,
        level: enrollment.level,
        email: enrollment.email,
      });

      whatsappSent = waResult.sent;
      if (!waResult.sent && waResult.error) {
        warnings.push(`WhatsApp: ${waResult.error}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "WhatsApp dispatch error";
      warnings.push(`WhatsApp error: ${errorMsg}`);
    }
  }

  return {
    emailSent,
    whatsappSent,
    warnings,
  };
}
