import { SITE_CONFIG } from "@/lib/constants";
import {
  STUDENT_WHATSAPP_GROUP_NAME,
  STUDENT_WHATSAPP_GROUP_URL,
  FOUNDER_LINKEDIN_DISPLAY,
} from "@/lib/constants/contact";

interface ApprovalEmailParams {
  studentName: string;
  email: string;
  password: string;
  courseName: string;
  level: string;
  loginUrl: string;
  whatsappGroupUrl?: string;
  whatsappGroupName?: string;
}

export function buildApprovalEmailHtml({
  studentName,
  email,
  password,
  courseName,
  level,
  loginUrl,
  whatsappGroupUrl = STUDENT_WHATSAPP_GROUP_URL,
  whatsappGroupName = STUDENT_WHATSAPP_GROUP_NAME,
}: ApprovalEmailParams): string {
  const firstName = studentName.split(" ")[0];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Registration Approved</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Segoe UI,Roboto,Arial,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6fb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,0.08);">
          <tr>
            <td style="padding:24px 28px 8px;text-align:center;background:#ffffff;">
              <img src="${SITE_CONFIG.url}${SITE_CONFIG.logo}" alt="${SITE_CONFIG.shortName}" width="240" style="max-width:240px;height:auto;display:inline-block;" />
            </td>
          </tr>
          <tr>
            <td style="background:linear-gradient(135deg,#ea580c,#f97316);padding:32px 28px;color:#ffffff;">
              <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.9;">Emerging Edge School of Technology</p>
              <h1 style="margin:0;font-size:28px;line-height:1.2;">Congratulations, ${firstName}! 🎉</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                Your registration has been <strong>approved</strong>. Welcome to the <strong>${courseName}</strong> batch (${level}).
              </p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#4b5563;">
                You can now sign in to your student portal to access live classes, lessons, assignments, and updates.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#c2410c;">Your Portal Login</p>
                    <p style="margin:0 0 8px;font-size:15px;"><strong>Username:</strong> ${email}</p>
                    <p style="margin:0 0 8px;font-size:15px;"><strong>Password:</strong> ${password}</p>
                    <p style="margin:0;font-size:15px;"><strong>Portal:</strong> <a href="${loginUrl}" style="color:#ea580c;">${loginUrl}</a></p>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="border-radius:999px;background:#ea580c;">
                    <a href="${loginUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;">Open Student Portal</a>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:16px;margin-bottom:20px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#047857;">Join WhatsApp Group Now</p>
                    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
                      After logging in, join <strong>${whatsappGroupName}</strong> for live class links, videos, and announcements.
                    </p>
                    <a href="${whatsappGroupUrl}" style="display:inline-block;padding:12px 24px;background:#25D366;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;border-radius:999px;">Join Group on WhatsApp</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
                Keep your login details private. If you need help, reply to this email or message us on WhatsApp.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 28px;border-top:1px solid #e5e7eb;background:#fafafa;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                ${SITE_CONFIG.name} · Learn. Build. Lead.
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

export function buildApprovalWhatsAppMessage({
  studentName,
  email,
  password,
  courseName,
  module,
  level,
  loginUrl,
}: ApprovalEmailParams & { module: string; level: string }): string {
  const firstName = studentName.split(" ")[0];

  return [
    `Congratulations ${firstName}!`,
    "",
    "Your registration at Emerging Edge School of Technology has been approved.",
    "",
    `Course: ${courseName}`,
    `Module: ${module}`,
    `Level: ${level}`,
    "",
    "Portal Login",
    `Email: ${email}`,
    `Password: ${password}`,
    `Link: ${loginUrl}`,
    "",
    "Log in to the portal — the WhatsApp group link is inside your student dashboard.",
    "",
    `Follow: ${FOUNDER_LINKEDIN_DISPLAY}`,
    "",
    "Welcome to your batch!",
    "— EEST Team",
  ].join("\n");
}

export function buildApprovalEmailText({
  studentName,
  email,
  password,
  courseName,
  level,
  loginUrl,
  whatsappGroupUrl = STUDENT_WHATSAPP_GROUP_URL,
  whatsappGroupName = STUDENT_WHATSAPP_GROUP_NAME,
}: ApprovalEmailParams): string {
  const firstName = studentName.split(" ")[0];

  return `Congratulations ${firstName}!

Your registration at Emerging Edge School of Technology has been approved.

Course: ${courseName}
Level: ${level}

Portal Login
Username: ${email}
Password: ${password}
Login: ${loginUrl}

Join WhatsApp Group Now
${whatsappGroupName}: ${whatsappGroupUrl}

Keep your login details private.`;
}
