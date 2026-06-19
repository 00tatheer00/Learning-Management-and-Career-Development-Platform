import { Resend } from "resend";
import {
  formatResendError,
  getEmailFromAddress,
  getEmailReplyTo,
} from "@/lib/notifications/email-config";
import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp";
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
    `Reset your password here (valid for 1 hour):`,
    resetUrl,
    "",
    "If you did not request this, you can ignore this message.",
    "",
    "— Emerging Edge Summer Training",
  ].join("\n");
}

export async function sendForgotPasswordNotifications(
  input: ForgotPasswordNoticeInput
): Promise<{ emailSent: boolean; whatsappSent: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  let emailSent = false;
  let whatsappSent = false;
  const text = buildMessage(input);
  const resetUrl = getPasswordResetUrl(input.token);

  const apiKey = process.env.RESEND_API_KEY;
  const from = getEmailFromAddress();

  if (apiKey && from) {
    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from,
        to: input.email,
        subject: "Reset your EEST portal password",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
            <p>Dear ${input.name},</p>
            <p>Click the button below to reset your password. This link expires in 1 hour.</p>
            <p style="margin:24px 0">
              <a href="${resetUrl}" style="display:inline-block;background:#ea580c;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:bold">
                Reset Password
              </a>
            </p>
            <p style="font-size:13px;color:#666">If you did not request this, ignore this email.</p>
          </div>
        `,
        text,
        replyTo: getEmailReplyTo(),
      });

      if (error) {
        warnings.push(`Email failed: ${formatResendError(error.message)}`);
      } else if (data?.id) {
        emailSent = true;
      }
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : "Email failed");
    }
  } else {
    warnings.push("Email not configured");
  }

  if (input.phone) {
    const whatsappResult = await sendWhatsAppMessage(
      input.phone,
      `🔐 *EEST Password Reset*\n\n${text}`
    );
    if (whatsappResult.sent) {
      whatsappSent = true;
    } else if (whatsappResult.error) {
      warnings.push(`WhatsApp failed: ${whatsappResult.error}`);
    }
  }

  return { emailSent, whatsappSent, warnings };
}
