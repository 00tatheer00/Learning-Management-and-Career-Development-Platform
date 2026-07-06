import { sendPasswordResetWhatsApp } from "@/lib/notifications/whatsapp";
import { getPortalLoginUrl } from "@/lib/site-url";

interface PasswordResetNoticeInput {
  fullName: string;
  email: string;
  whatsapp: string;
  password: string;
}

export async function sendPasswordResetNotifications(
  input: PasswordResetNoticeInput
): Promise<{ whatsappSent: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  const loginUrl = getPortalLoginUrl();

  const text = [
    `Dear ${input.fullName},`,
    "",
    "Your EEST student portal password has been reset by an administrator.",
    "",
    `Login: ${loginUrl}`,
    `Username: ${input.email}`,
    `New Password: ${input.password}`,
    "",
    "Keep your login details private.",
    "",
    "— Emerging Edge Summer Training",
  ].join("\n");

  const whatsappResult = await sendPasswordResetWhatsApp(
    input.whatsapp,
    `🔑 *EEST Password Reset*\n\n${text}`
  );

  if (!whatsappResult.sent && whatsappResult.error) {
    warnings.push(`Password reset WhatsApp failed: ${whatsappResult.error}`);
  }

  return { whatsappSent: whatsappResult.sent, warnings };
}
