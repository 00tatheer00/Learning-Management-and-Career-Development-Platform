import { Resend } from "resend";
import { buildApprovalEmailHtml, buildApprovalEmailText } from "@/lib/notifications/approval-templates";
import {
  formatResendError,
  getEmailFromAddress,
  getEmailReplyTo,
} from "@/lib/notifications/email-config";

interface SendApprovalEmailInput {
  to: string;
  studentName: string;
  email: string;
  password: string;
  courseName: string;
  level: string;
  loginUrl: string;
}

export async function sendApprovalEmail(
  input: SendApprovalEmailInput
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = getEmailFromAddress();

  if (!apiKey || !from) {
    return {
      sent: false,
      error: "Email not configured. Add RESEND_API_KEY and EMAIL_FROM on Vercel.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const html = buildApprovalEmailHtml(input);
    const text = buildApprovalEmailText(input);

    const { data, error } = await resend.emails.send({
      from,
      to: input.to,
      subject: "Congratulations! Your EEST registration is approved",
      html,
      text,
      replyTo: getEmailReplyTo(),
    });

    if (error) {
      console.error("Resend error:", error);
      return { sent: false, error: formatResendError(error.message) };
    }

    if (!data?.id) {
      return { sent: false, error: "Email API returned no message id" };
    }

    return { sent: true };
  } catch (error) {
    console.error("Send approval email failed:", error);
    return {
      sent: false,
      error: error instanceof Error ? formatResendError(error.message) : "Failed to send email",
    };
  }
}
