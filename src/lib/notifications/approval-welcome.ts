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
): Promise<{ emailSent: boolean; warnings: string[] }> {
  try {
    enqueueApprovalEmail({
      email: enrollment.email,
      fullName: enrollment.fullName,
      password: enrollment.password,
      program: enrollment.program,
    });

    return {
      emailSent: true,
      warnings: [],
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Failed to queue approval email";
    return {
      emailSent: false,
      warnings: [errorMsg],
    };
  }
}
