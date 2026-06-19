import { SITE_CONFIG } from "@/lib/constants";

export function getEmailFromAddress(): string | null {
  const from = process.env.EMAIL_FROM?.trim();
  return from || null;
}

export function getEmailReplyTo(): string | undefined {
  return process.env.EMAIL_REPLY_TO?.trim() || SITE_CONFIG.email;
}

export function formatResendError(message: string): string {
  if (message.includes("domain is not verified")) {
    return "Email failed: verify emergingedge.tech at resend.com/domains, then set EMAIL_FROM to e.g. EEST <noreply@emergingedge.tech>";
  }
  if (message.includes("only send testing emails to your own email")) {
    return "Email failed: Resend test mode only sends to your Resend account email until a domain is verified.";
  }
  return message;
}
