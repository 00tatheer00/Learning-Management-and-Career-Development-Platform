import { SITE_CONFIG } from "@/lib/constants";

const DEFAULT_EMAIL_FROM = "EEST <noreply@emergingedge.tech>";

/** Resend accepts `email@domain.com` or `Name <email@domain.com>`. */
const PLAIN_EMAIL = /^[^\s<>,]+@[^\s<>,]+\.[^\s<>,]+$/;
const NAMED_EMAIL = /^.+<[^\s<>,]+@[^\s<>,]+\.[^\s<>,]+>$/;

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function normalizeEmailFrom(raw: string): string {
  let from = stripWrappingQuotes(raw);

  if (PLAIN_EMAIL.test(from) || NAMED_EMAIL.test(from)) {
    return from;
  }

  // Fix: EEST noreply@emergingedge.tech (missing angle brackets)
  const looseNamed = /^(.+?)\s+([^\s<>]+@[^\s<>]+\.[^\s<>]+)$/.exec(from);
  if (looseNamed) {
    return `${looseNamed[1]!.trim()} <${looseNamed[2]!}>`;
  }

  // Fix: EEST<noreply@...> (missing spaces)
  const tightNamed = /^(.+?)<([^\s<>,]+@[^\s<>,]+\.[^\s<>,]+)>$/.exec(from);
  if (tightNamed) {
    return `${tightNamed[1]!.trim()} <${tightNamed[2]!}>`;
  }

  return from;
}

export function getEmailFromAddress(): string | null {
  const raw = process.env.EMAIL_FROM?.trim();
  if (!raw) return DEFAULT_EMAIL_FROM;

  const normalized = normalizeEmailFrom(raw);
  if (PLAIN_EMAIL.test(normalized) || NAMED_EMAIL.test(normalized)) {
    return normalized;
  }

  console.warn("[email] Invalid EMAIL_FROM env, using default:", raw);
  return DEFAULT_EMAIL_FROM;
}

export function getEmailReplyTo(): string | undefined {
  const replyTo = process.env.EMAIL_REPLY_TO?.trim();
  if (!replyTo) return SITE_CONFIG.email;
  return stripWrappingQuotes(replyTo);
}

export function formatResendError(message: string): string {
  if (message.includes("Invalid `from` field")) {
    return "Email failed: set Vercel EMAIL_FROM to exactly EEST <noreply@emergingedge.tech> (no extra quotes).";
  }
  if (message.includes("domain is not verified")) {
    return "Email failed: verify emergingedge.tech at resend.com/domains, then set EMAIL_FROM to e.g. EEST <noreply@emergingedge.tech>";
  }
  if (message.includes("only send testing emails to your own email")) {
    return "Email failed: Resend test mode only sends to your Resend account email until a domain is verified.";
  }
  return message;
}
