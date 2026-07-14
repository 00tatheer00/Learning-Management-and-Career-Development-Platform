import { Resend } from "resend";
import { buildApprovalEmailHtml, buildApprovalEmailText } from "@/lib/notifications/approval-templates";
import {
  formatResendError,
  getEmailFromAddress,
  getEmailReplyTo,
} from "@/lib/notifications/email-config";
import { wrapStudentEmailHtml, emailButton } from "@/lib/notifications/student-email-layout";

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

export function buildForgotPasswordEmailHtml(studentName: string, resetUrl: string): string {
  const bodyHtml = `
    <p style="font-size:16px;line-height:1.5;margin:0 0 16px;color:#374151;">
      Dear ${studentName},
    </p>
    <p style="font-size:15px;line-height:1.5;margin:0 0 16px;color:#374151;">
      We received a request to reset your EEST Portal password. You can reset it by clicking the button below:
    </p>
    ${emailButton(resetUrl, "Reset Password", "#ea580c")}
    <p style="font-size:14px;line-height:1.5;margin:24px 0 0;color:#6b7280;">
      This link is valid for <strong>1 hour</strong>. If you did not request this, you can safely ignore this email.
    </p>
  `;

  return wrapStudentEmailHtml({
    preheader: "Reset your EEST Portal password.",
    heroLabel: "Password Reset Request",
    heroTitle: "Reset Your Password",
    heroGradient: "linear-gradient(135deg,#ea580c,#f97316)",
    bodyHtml,
  });
}

export function buildForgotPasswordEmailText(studentName: string, resetUrl: string): string {
  return [
    `Dear ${studentName},`,
    "",
    "We received a request to reset your EEST portal password.",
    "",
    "Reset your password here (valid for 1 hour):",
    resetUrl,
    "",
    "If you did not request this, you can ignore this email.",
    "",
    "— Emerging Edge Summer Training",
  ].join("\n");
}

interface SendForgotPasswordEmailInput {
  to: string;
  studentName: string;
  resetUrl: string;
}

export async function sendForgotPasswordEmail(
  input: SendForgotPasswordEmailInput
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
    const html = buildForgotPasswordEmailHtml(input.studentName, input.resetUrl);
    const text = buildForgotPasswordEmailText(input.studentName, input.resetUrl);

    const { data, error } = await resend.emails.send({
      from,
      to: input.to,
      subject: "Reset your EEST Portal password",
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
    console.error("Send forgot password email failed:", error);
    return {
      sent: false,
      error: error instanceof Error ? formatResendError(error.message) : "Failed to send email",
    };
  }
}
