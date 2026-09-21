import { Resend } from "resend";
import {
  formatResendError,
  getEmailFromAddress,
  getEmailReplyTo,
} from "@/lib/notifications/email-config";
import { SITE_CONFIG } from "@/lib/constants";

export interface SendTrainerSalaryEmailInput {
  to: string;
  trainerName: string;
  courseTitle: string;
  phaseLabel: string;
  periodLabel: string;
  studentCount: number;
  amount: number;
  paidBy: string;
  paymentAccount?: string | null;
  recipientAccount?: string | null;
  transactionRef?: string | null;
  paidAt: string | Date;
  note?: string | null;
}

export function buildTrainerSalaryEmailHtml(input: SendTrainerSalaryEmailInput): string {
  const formattedAmount = `PKR ${input.amount.toLocaleString("en-PK")}`;
  const formattedDate = new Date(input.paidAt).toLocaleString("en-PK", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const detailRows: Array<{ label: string; value: string }> = [
    { label: "Course / Program", value: input.courseTitle },
    { label: "Phase", value: input.phaseLabel },
    { label: "Period", value: input.periodLabel },
    { label: "Students Mentored", value: `${input.studentCount} students` },
    { label: "Disbursed By", value: input.paidBy },
    { label: "Payment Channel", value: input.paymentAccount || "Direct Bank / Online Transfer" },
  ];

  if (input.recipientAccount) {
    detailRows.push({ label: "Recipient Account", value: input.recipientAccount });
  }
  if (input.transactionRef) {
    detailRows.push({ label: "Transaction / Ref ID", value: input.transactionRef });
  }
  detailRows.push({ label: "Date & Time", value: formattedDate });
  if (input.note) {
    detailRows.push({ label: "Remarks / Notes", value: input.note });
  }

  const rowsHtml = detailRows
    .map(
      (row) => `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;font-weight:600;width:38%;">
          ${row.label}
        </td>
        <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:14px;font-weight:700;">
          ${row.value}
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Salary Disbursement Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Your salary remuneration of ${formattedAmount} for ${input.courseTitle} (${input.phaseLabel}) has been processed and disbursed.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.06);border:1px solid #e2e8f0;">
          
          <!-- Logo Brand Header -->
          <tr>
            <td style="padding:28px 32px 14px;text-align:center;background:#ffffff;">
              <img src="${SITE_CONFIG.url}${SITE_CONFIG.logo}" alt="${SITE_CONFIG.shortName}" width="200" style="max-width:200px;height:auto;display:inline-block;" />
            </td>
          </tr>

          <!-- Hero Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #059669 0%, #0d9488 100%);padding:30px 32px;color:#ffffff;text-align:center;">
              <span style="display:inline-block;padding:4px 12px;background:rgba(255,255,255,0.2);backdrop-filter:blur(4px);border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px;">
                Remuneration Slip
              </span>
              <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;letter-spacing:-0.02em;line-height:1.2;">
                Salary Payment Disbursed
              </h1>
              <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.92);font-weight:500;">
                ${input.courseTitle} · ${input.phaseLabel}
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
                Dear <strong>${input.trainerName}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">
                We are pleased to inform you that your salary payment for mentoring students in <strong>${input.courseTitle}</strong> (${input.phaseLabel}) has been processed and disbursed.
              </p>

              <!-- Amount Highlight Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:18px;margin-bottom:28px;text-align:center;padding:22px 16px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#047857;">
                      Amount Disbursed
                    </p>
                    <p style="margin:0;font-size:32px;font-weight:900;color:#065f46;letter-spacing:-0.02em;">
                      ${formattedAmount}
                    </p>
                    <p style="margin:6px 0 0;font-size:12px;color:#059669;font-weight:600;">
                      ${input.studentCount} Students Mentored · Rate: PKR ${Math.round(input.amount / (input.studentCount || 1))} / student
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Details Table -->
              <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;font-weight:700;">
                Transaction Breakdown
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;margin-bottom:28px;">
                ${rowsHtml}
              </table>

              <!-- Appreciation Note -->
              <div style="background:#f1f5f9;border-radius:14px;padding:18px 20px;border-left:4px solid #059669;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#334155;">
                  <strong>Thank you for your outstanding contribution!</strong> Your dedication, hands-on mentorship, and guidance make a profound difference in our students' learning journey.
                </p>
              </div>

              <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#64748b;">
                If you have any questions or require an adjustment, please feel free to reach out directly to the EEST administration.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:22px 32px 30px;border-top:1px solid #f1f5f9;background:#fafafa;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0f172a;">
                ${SITE_CONFIG.name}
              </p>
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                Learn. Build. Lead. · Automated Remuneration System
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildTrainerSalaryEmailText(input: SendTrainerSalaryEmailInput): string {
  const formattedAmount = `PKR ${input.amount.toLocaleString("en-PK")}`;
  const formattedDate = new Date(input.paidAt).toLocaleString("en-PK", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const lines = [
    `Dear ${input.trainerName},`,
    "",
    `Your salary remuneration of ${formattedAmount} for ${input.courseTitle} (${input.phaseLabel}) has been processed and disbursed.`,
    "",
    `--- Transaction Details ---`,
    `Course: ${input.courseTitle}`,
    `Phase: ${input.phaseLabel}`,
    `Period: ${input.periodLabel}`,
    `Students Mentored: ${input.studentCount}`,
    `Amount Disbursed: ${formattedAmount}`,
    `Disbursed By: ${input.paidBy}`,
    `Payment Channel: ${input.paymentAccount || "Direct Bank / Online Transfer"}`,
  ];

  if (input.recipientAccount) {
    lines.push(`Recipient Account: ${input.recipientAccount}`);
  }
  if (input.transactionRef) {
    lines.push(`Transaction / Ref ID: ${input.transactionRef}`);
  }
  lines.push(`Date & Time: ${formattedDate}`);
  if (input.note) {
    lines.push(`Remarks / Notes: ${input.note}`);
  }

  lines.push(
    "",
    "Thank you for your hard work and mentorship!",
    "",
    "— Emerging Edge School of Technology (EEST)"
  );

  return lines.join("\n");
}

export async function sendTrainerSalaryEmail(
  input: SendTrainerSalaryEmailInput
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = getEmailFromAddress();

  if (!apiKey || !from) {
    return {
      sent: false,
      error: "Email not configured. Add RESEND_API_KEY and EMAIL_FROM.",
    };
  }

  if (!input.to || !input.to.includes("@")) {
    return {
      sent: false,
      error: "Invalid trainer email address.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const html = buildTrainerSalaryEmailHtml(input);
    const text = buildTrainerSalaryEmailText(input);

    const { data, error } = await resend.emails.send({
      from,
      to: input.to,
      subject: `Salary Disbursement: ${input.courseTitle} (${input.phaseLabel}) — ${input.trainerName}`,
      html,
      text,
      replyTo: getEmailReplyTo(),
    });

    if (error) {
      console.error("[TRAINER_SALARY_EMAIL_ERROR]:", error);
      return { sent: false, error: formatResendError(error.message) };
    }

    if (!data?.id) {
      return { sent: false, error: "Email provider returned no message id" };
    }

    return { sent: true };
  } catch (error) {
    console.error("[TRAINER_SALARY_EMAIL_EXCEPTION]:", error);
    return {
      sent: false,
      error: error instanceof Error ? formatResendError(error.message) : "Failed to send email",
    };
  }
}
