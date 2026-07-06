import { sendForgotPasswordWhatsApp } from "@/lib/notifications/whatsapp";
import { getPasswordResetUrl } from "@/lib/auth/password-reset";

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
): Promise<{ whatsappSent: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  const text = buildMessage(input);

  if (!input.phone?.trim()) {
    warnings.push("No WhatsApp number on file");
    return { whatsappSent: false, warnings };
  }

  const whatsappResult = await sendForgotPasswordWhatsApp(
    input.phone,
    `🔐 *EEST Password Reset*\n\n${text}`
  );

  if (!whatsappResult.sent && whatsappResult.error) {
    warnings.push(`WhatsApp failed: ${whatsappResult.error}`);
  }

  return { whatsappSent: whatsappResult.sent, warnings };
}
