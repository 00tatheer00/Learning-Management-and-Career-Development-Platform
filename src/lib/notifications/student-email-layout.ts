import { SITE_CONFIG } from "@/lib/constants";

export function wrapStudentEmailHtml(input: {
  preheader: string;
  heroLabel: string;
  heroTitle: string;
  heroGradient?: string;
  bodyHtml: string;
}): string {
  const gradient = input.heroGradient ?? "linear-gradient(135deg,#1d4ed8,#2563eb)";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${input.heroTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Segoe UI,Roboto,Arial,sans-serif;color:#1f2937;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${input.preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6fb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,0.08);">
          <tr>
            <td style="padding:24px 28px 8px;text-align:center;background:#ffffff;">
              <img src="${SITE_CONFIG.url}${SITE_CONFIG.logo}" alt="${SITE_CONFIG.shortName}" width="220" style="max-width:220px;height:auto;display:inline-block;" />
            </td>
          </tr>
          <tr>
            <td style="background:${gradient};padding:28px 28px;color:#ffffff;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.92;">${input.heroLabel}</p>
              <h1 style="margin:0;font-size:26px;line-height:1.25;font-weight:700;">${input.heroTitle}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${input.bodyHtml}
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

export function emailButton(href: string, label: string, color = "#2563eb"): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:20px auto 0;">
    <tr>
      <td style="border-radius:999px;background:${color};">
        <a href="${href}" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;">${label}</a>
      </td>
    </tr>
  </table>`;
}

export function emailInfoBox(title: string, rows: Array<{ label: string; value: string }>): string {
  const lines = rows
    .map(
      (row) =>
        `<p style="margin:0 0 8px;font-size:15px;line-height:1.5;"><strong>${row.label}:</strong> ${row.value}</p>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;margin:0 0 20px;">
    <tr>
      <td style="padding:20px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1d4ed8;">${title}</p>
        ${lines}
      </td>
    </tr>
  </table>`;
}
