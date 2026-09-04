import { enqueueApprovalEmail } from "@/lib/notifications/email-handlers";

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
  const whatsappSent = false;

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

  // Automated WhatsApp dispatch has been completely removed in favor of manual staff template sending.

  return {
    emailSent,
    whatsappSent,
    warnings,
  };
}
