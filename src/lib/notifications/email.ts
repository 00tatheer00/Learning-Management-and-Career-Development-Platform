import { Resend } from "resend";
import { SITE_CONFIG } from "@/lib/constants";
import { buildApprovalEmailHtml } from "@/lib/notifications/approval-templates";

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
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return { sent: false, error: "Email service not configured (RESEND_API_KEY, EMAIL_FROM)" };
  }

  try {
    const resend = new Resend(apiKey);
    const html = buildApprovalEmailHtml(input);

    const { error } = await resend.emails.send({
      from,
      to: input.to,
      subject: `Congratulations! Your EEST registration is approved`,
      html,
      replyTo: SITE_CONFIG.email,
    });

    if (error) {
      return { sent: false, error: error.message };
    }

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
