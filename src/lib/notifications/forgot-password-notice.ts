import { getPasswordResetUrl } from "@/lib/auth/password-reset";
import { sendForgotPasswordEmail } from "@/lib/notifications/email";

interface ForgotPasswordNoticeInput {
  name: string;
  email: string;
  phone?: string;
  token: string;
}

export async function sendForgotPasswordNotifications(
  input: ForgotPasswordNoticeInput
): Promise<{ whatsappSent: boolean; emailSent: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  const resetUrl = getPasswordResetUrl(input.token);

  // Send Email
  let emailSent = false;
  try {
    const emailResult = await sendForgotPasswordEmail({
      to: input.email,
      studentName: input.name,
      resetUrl,
    });
    emailSent = emailResult.sent;
    if (!emailResult.sent && emailResult.error) {
      warnings.push(`Email failed: ${emailResult.error}`);
    }
  } catch (error) {
    warnings.push(`Email exception: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  return { whatsappSent: false, emailSent, warnings };
}
