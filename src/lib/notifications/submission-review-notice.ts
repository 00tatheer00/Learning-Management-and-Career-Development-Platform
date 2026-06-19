import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp";
import { Resend } from "resend";
import {
  getEmailFromAddress,
  getEmailReplyTo,
} from "@/lib/notifications/email-config";

interface SubmissionReviewNoticeInput {
  studentName: string;
  email: string;
  whatsapp?: string;
  assignmentTitle: string;
  status: "approved" | "needs_revision";
  feedback?: string;
}

function buildText(input: SubmissionReviewNoticeInput): string {
  const statusLabel =
    input.status === "approved" ? "Approved ✓" : "Needs revision — please resubmit";

  return [
    `Dear ${input.studentName},`,
    "",
    `Your assignment "${input.assignmentTitle}" has been reviewed.`,
    "",
    `Status: ${statusLabel}`,
    input.feedback ? `Feedback: ${input.feedback}` : "",
    "",
    "Log in to your student portal to view details.",
    "",
    "— EEST Team",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendSubmissionReviewNotifications(
  input: SubmissionReviewNoticeInput
): Promise<{ emailSent: boolean; whatsappSent: boolean }> {
  const text = buildText(input);
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
        subject: `Assignment update: ${input.assignmentTitle}`,
        html: `<pre style="font-family:Arial,sans-serif;white-space:pre-wrap">${text}</pre>`,
        text,
        replyTo: getEmailReplyTo(),
      });
      emailSent = Boolean(data?.id && !error);
    } catch {
      emailSent = false;
    }
  }

  if (input.whatsapp) {
    const emoji = input.status === "approved" ? "✅" : "📝";
    const result = await sendWhatsAppMessage(
      input.whatsapp,
      `${emoji} *Assignment Review*\n\n${text}`
    );
    whatsappSent = result.sent;
  }

  return { emailSent, whatsappSent };
}
