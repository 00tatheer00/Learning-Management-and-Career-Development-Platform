import { sendForgotPasswordWhatsApp } from "@/lib/notifications/whatsapp";
import { getPasswordResetUrl } from "@/lib/auth/password-reset";
import { sendForgotPasswordEmail } from "@/lib/notifications/email";

interface ForgotPasswordNoticeInput {
  name: string;
  email: string;
  phone?: string;
  token: string;
}

function buildMessage(input: ForgotPasswordNoticeInput): string {
  const resetUrl = getPasswordResetUrl(input.token);

  return [
    `Dear ${input.name},`,
    "",
    "We received a request to reset your EEST portal password.",
    "",
    "Reset your password here (valid for 1 hour):",
    resetUrl,
    "",
    "If you did not request this, you can ignore this message.",
    "",
    "— Emerging Edge Summer Training",
  ].join("\n");
}

export async function sendForgotPasswordNotifications(
  input: ForgotPasswordNoticeInput
): Promise<{ whatsappSent: boolean; emailSent: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  const text = buildMessage(input);
  const resetUrl = getPasswordResetUrl(input.token);

  // 1. Send Email
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

  // 2. Send WhatsApp
  let whatsappSent = false;
  if (input.phone?.trim()) {
    const whatsappResult = await sendForgotPasswordWhatsApp(
      input.phone,
      `🔐 *EEST Password Reset*\n\n${text}`
    );
    whatsappSent = whatsappResult.sent;
    if (!whatsappResult.sent && whatsappResult.error) {
      warnings.push(`WhatsApp failed: ${whatsappResult.error}`);
    }
  } else {
    warnings.push("No WhatsApp number on file");
  }

  return { whatsappSent, emailSent, warnings };
}
