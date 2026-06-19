import { Resend } from "resend";
import { getProgramBySlug } from "@/lib/data/programs";
import {
  formatResendError,
  getEmailFromAddress,
  getEmailReplyTo,
} from "@/lib/notifications/email-config";
import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp";
import { SITE_CONFIG } from "@/lib/constants";

interface RejectionNoticeInput {
  fullName: string;
  email: string;
  whatsapp: string;
  program: string;
  level: string;
  reason?: string;
}

function buildRejectionText(input: RejectionNoticeInput): string {
  const courseName = getProgramBySlug(input.program)?.title ?? input.program;
  const reason = input.reason?.trim() || "Your application could not be approved at this time.";

  return [
    `Dear ${input.fullName},`,
    "",
    `Thank you for applying to EEST for ${courseName} (${input.level}).`,
    "",
    "Unfortunately, your registration has not been approved.",
    "",
    `Reason: ${reason}`,
    "",
    `If you have questions, contact us at ${SITE_CONFIG.email} or WhatsApp ${SITE_CONFIG.whatsapp}.`,
    "",
    "— Emerging Edge Summer Training",
  ].join("\n");
}

function buildRejectionHtml(input: RejectionNoticeInput): string {
  const courseName = getProgramBySlug(input.program)?.title ?? input.program;
  const reason = input.reason?.trim() || "Your application could not be approved at this time.";

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2 style="color:#b91c1c;margin:0 0 12px">Registration Update</h2>
      <p>Dear ${input.fullName},</p>
      <p>Thank you for applying to EEST for <strong>${courseName}</strong> (${input.level}).</p>
      <p>Unfortunately, your registration has <strong>not been approved</strong>.</p>
      <p style="background:#fef2f2;border-left:4px solid #b91c1c;padding:12px 16px;margin:16px 0">
        <strong>Reason:</strong> ${reason}
      </p>
      <p>Questions? Contact us at ${SITE_CONFIG.email} or WhatsApp ${SITE_CONFIG.whatsapp}.</p>
      <p style="margin-top:24px;color:#666">— Emerging Edge Summer Training</p>
    </div>
  `;
}

export async function sendRejectionNotifications(
  input: RejectionNoticeInput
): Promise<{ emailSent: boolean; whatsappSent: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  let emailSent = false;
  let whatsappSent = false;

  const apiKey = process.env.RESEND_API_KEY;
  const from = getEmailFromAddress();

  if (apiKey && from) {
    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from,
        to: input.email,
        subject: "EEST Registration Update",
        html: buildRejectionHtml(input),
        text: buildRejectionText(input),
        replyTo: getEmailReplyTo(),
      });

      if (error) {
        warnings.push(`Rejection email failed: ${formatResendError(error.message)}`);
      } else if (data?.id) {
        emailSent = true;
      }
    } catch (error) {
      warnings.push(
        `Rejection email failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  } else {
    warnings.push("Rejection email not configured");
  }

  const whatsappMessage = `❌ *EEST Registration Update*\n\n${buildRejectionText(input)}`;
  const whatsappResult = await sendWhatsAppMessage(input.whatsapp, whatsappMessage);

  if (whatsappResult.sent) {
    whatsappSent = true;
  } else if (whatsappResult.error) {
    warnings.push(`Rejection WhatsApp failed: ${whatsappResult.error}`);
  }

  return { emailSent, whatsappSent, warnings };
}
