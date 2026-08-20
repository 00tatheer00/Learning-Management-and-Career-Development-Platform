import { getPasswordResetUrl } from "@/lib/auth/password-reset";
import { enqueueForgotPasswordEmail } from "@/lib/notifications/email-handlers";

interface ForgotPasswordNoticeInput {
  name: string;
  email: string;
  phone?: string;
  token: string;
}

export async function sendForgotPasswordNotifications(
  input: ForgotPasswordNoticeInput
): Promise<{ emailSent: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  const resetUrl = getPasswordResetUrl(input.token);

  try {
    enqueueForgotPasswordEmail({
      email: input.email,
      name: input.name,
      resetUrl,
    });
    return { emailSent: true, warnings: [] };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Failed to queue password reset email";
    warnings.push(`Email exception: ${errorMsg}`);
    return { emailSent: false, warnings };
  }
}
