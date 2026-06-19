import { Resend } from "resend";
import {
  formatResendError,
  getEmailFromAddress,
  getEmailReplyTo,
} from "@/lib/notifications/email-config";
import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp";
import { getPortalLoginUrl } from "@/lib/site-url";

interface PasswordResetNoticeInput {
  fullName: string;
  email: string;
  whatsapp: string;
  password: string;
}

export async function sendPasswordResetNotifications(
  input: PasswordResetNoticeInput
): Promise<{ emailSent: boolean; whatsappSent: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  let emailSent = false;
  let whatsappSent = false;
  const loginUrl = getPortalLoginUrl();

  const text = [
    `Dear ${input.fullName},`,
    "",
    "Your EEST student portal password has been reset by an administrator.",
    "",
    `Login: ${loginUrl}`,
    `Email: ${input.email}`,
    `New Password: ${input.password}`,
    "",
    "Please change this password after logging in if the option is available.",
    "",
    "— Emerging Edge Summer Training",
  ].join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  const from = getEmailFromAddress();

  if (apiKey && from) {
    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from,
        to: input.email,
        subject: "Your EEST portal password was reset",
        html: `<pre style="font-family:Arial,sans-serif;white-space:pre-wrap">${text}</pre>`,
        text,
        replyTo: getEmailReplyTo(),
      });

      if (error) {
        warnings.push(`Password reset email failed: ${formatResendError(error.message)}`);
      } else if (data?.id) {
        emailSent = true;
      }
    } catch (error) {
      warnings.push(
        `Password reset email failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  } else {
    warnings.push("Password reset email not configured");
  }

  const whatsappResult = await sendWhatsAppMessage(
    input.whatsapp,
    `🔑 *EEST Password Reset*\n\n${text}`
  );

  if (whatsappResult.sent) {
    whatsappSent = true;
  } else if (whatsappResult.error) {
    warnings.push(`Password reset WhatsApp failed: ${whatsappResult.error}`);
  }

  return { emailSent, whatsappSent, warnings };
}
