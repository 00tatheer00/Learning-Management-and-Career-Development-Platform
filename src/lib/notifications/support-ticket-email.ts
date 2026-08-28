import { Resend } from "resend";
import {
  formatResendError,
  getEmailFromAddress,
  getEmailReplyTo,
} from "@/lib/notifications/email-config";
import { wrapStudentEmailHtml, emailButton, emailInfoBox } from "@/lib/notifications/student-email-layout";
import { SITE_CONFIG } from "@/lib/constants";

export interface SupportTicketReplyEmailInput {
  to: string;
  studentName: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: string;
  adminReply: string;
  isGuest?: boolean;
}

export function buildSupportTicketReplyEmailHtml(input: SupportTicketReplyEmailInput): string {
  const { studentName, ticketNumber, subject, category, status, adminReply, isGuest } = input;

  const statusLabel =
    status === "resolved"
      ? "Resolved"
      : status === "in_progress"
      ? "In Progress"
      : status === "closed"
      ? "Closed"
      : "Open";

  const targetUrl = isGuest
    ? `${SITE_CONFIG.url}/support`
    : `${SITE_CONFIG.url}/student/support`;

  const infoRows = [
    { label: "Ticket Number", value: ticketNumber },
    { label: "Subject", value: subject },
    { label: "Category", value: category.toUpperCase() },
    { label: "Current Status", value: `<span style="display:inline-block;padding:2px 10px;border-radius:12px;background:${status === "resolved" ? "#dcfce7;color:#15803d" : "#e0e7ff;color:#4338ca"};font-weight:700;font-size:13px;">${statusLabel}</span>` },
  ];

  const bodyHtml = `
    <p style="font-size:16px;line-height:1.5;margin:0 0 16px;color:#374151;">
      Dear <strong>${studentName}</strong>,
    </p>
    <p style="font-size:15px;line-height:1.5;margin:0 0 20px;color:#374151;">
      Our support team has reviewed and responded to your ticket <strong>${ticketNumber}</strong>.
    </p>

    ${emailInfoBox("Ticket Details", infoRows)}

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #2563eb;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#1e40af;">
        Support Team Response:
      </p>
      <div style="font-size:15px;line-height:1.6;color:#1f2937;white-space:pre-wrap;">${adminReply}</div>
    </div>

    <p style="font-size:14px;line-height:1.5;margin:0 0 16px;color:#4b5563;text-align:center;">
      You can track this ticket, respond, or check updates at any time:
    </p>

    ${emailButton(targetUrl, isGuest ? "Track Support Ticket" : "View in Student Portal", "#2563eb")}

    <p style="font-size:13px;line-height:1.5;margin:28px 0 0;color:#9ca3af;text-align:center;">
      If you have further questions or if your issue is not resolved, please reply via the support portal.
    </p>
  `;

  return wrapStudentEmailHtml({
    preheader: `Response to your support ticket ${ticketNumber}: ${subject}`,
    heroLabel: "Helpdesk & Student Support",
    heroTitle: `Update on Ticket ${ticketNumber}`,
    heroGradient: status === "resolved" ? "linear-gradient(135deg,#059669,#10b981)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
    bodyHtml,
  });
}

export function buildSupportTicketReplyEmailText(input: SupportTicketReplyEmailInput): string {
  const { studentName, ticketNumber, subject, status, adminReply, isGuest } = input;
  const targetUrl = isGuest
    ? `${SITE_CONFIG.url}/support`
    : `${SITE_CONFIG.url}/student/support`;

  return [
    `Dear ${studentName},`,
    "",
    `Our support team has updated your ticket ${ticketNumber}.`,
    "",
    `Ticket Number: ${ticketNumber}`,
    `Subject: ${subject}`,
    `Status: ${status}`,
    "",
    "--- Support Team Response ---",
    adminReply,
    "-----------------------------",
    "",
    `View and track your ticket here: ${targetUrl}`,
    "",
    `— ${SITE_CONFIG.name} Support Team`,
  ].join("\n");
}

export async function sendSupportTicketReplyEmail(
  input: SupportTicketReplyEmailInput
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
    const html = buildSupportTicketReplyEmailHtml(input);
    const text = buildSupportTicketReplyEmailText(input);

    const { data, error } = await resend.emails.send({
      from,
      to: input.to,
      subject: `[${input.ticketNumber}] Support Team Response: ${input.subject}`,
      html,
      text,
      replyTo: getEmailReplyTo(),
    });

    if (error) {
      console.error("[SUPPORT_EMAIL_RESEND_ERROR]:", error);
      return { sent: false, error: formatResendError(error.message) };
    }

    if (!data?.id) {
      return { sent: false, error: "Email API returned no message id" };
    }

    return { sent: true };
  } catch (error) {
    console.error("[SUPPORT_EMAIL_FAILED]:", error);
    return {
      sent: false,
      error: error instanceof Error ? formatResendError(error.message) : "Failed to send email",
    };
  }
}
