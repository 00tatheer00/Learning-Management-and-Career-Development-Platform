import { getProgramBySlug } from "@/lib/data/programs";

/**
 * UltraMsg configuration helper
 */
export function getUltraMsgConfig() {
  const instanceId = (process.env.ULTRAMSG_INSTANCE_ID ?? "").trim();
  const token = (process.env.ULTRAMSG_TOKEN ?? "").trim();
  const isExplicitlyDisabled = process.env.ULTRAMSG_ENABLED === "false";
  const isConfigured = Boolean(instanceId && token && !isExplicitlyDisabled);

  return {
    instanceId,
    token,
    isConfigured,
  };
}

/**
 * Sanitizes phone numbers into standard international format for WhatsApp / UltraMsg.
 * Formats Pakistani numbers (e.g., 03001234567, +92 300 1234567) into 923001234567.
 */
export function sanitizeWhatsAppPhone(phone?: string | null): string | null {
  if (!phone) return null;

  // Strip all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // Handle leading 00 (e.g. 00923001234567)
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.slice(2);
  }

  // Handle Pakistani local format (03XXXXXXXXX -> 923XXXXXXXXX)
  if (cleaned.startsWith("03") && cleaned.length === 11) {
    cleaned = `92${cleaned.slice(1)}`;
  }

  // Ensure reasonable international phone length (between 10 and 15 digits)
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    return cleaned;
  }

  return null;
}

/**
 * Asserts that a text contains absolutely no URLs or clickable web links.
 * Checks for http://, https://, www., URL shorteners, or naked web domains (excluding email addresses).
 * WhatsApp anti-spam filters penalize accounts sending links to new users.
 */
export function assertZeroLinks(text: string): void {
  // Check for protocols, www prefix, or URL shorteners
  if (/(https?:\/\/|www\.|ftp:\/\/|wa\.me\/|bit\.ly\/|t\.co\/)/i.test(text)) {
    throw new Error("WhatsApp policy violation: Message must not contain any URLs or web links.");
  }

  // Check for standalone website domains (e.g. site.com), while safely allowing email addresses
  const words = text.split(/\s+/);
  for (const word of words) {
    if (word.includes("@")) continue; // email address is allowed
    const cleanWord = word.replace(/[*_~`,.!?:;()\[\]]/g, "");
    if (/^[a-zA-Z0-9-]+\.(com|tech|edu|org|net|io|app|dev|pk)(\/[^\s]*)?$/i.test(cleanWord)) {
      throw new Error(`WhatsApp policy violation: Found web link domain in message: ${word}`);
    }
  }
}

export interface SendApprovalWhatsAppParams {
  fullName: string;
  whatsapp?: string | null;
  program: string;
  level?: string | null;
  email: string;
}

/**
 * Formats the official Option 2 Professional English approval WhatsApp template.
 * Strictly adheres to zero-link deliverability policy.
 */
export function formatApprovalWhatsAppMessage(params: {
  studentName: string;
  courseTitle: string;
  moduleName: string;
  email: string;
}): string {
  const { studentName, courseTitle, moduleName, email } = params;

  const message = [
    `🎉 *Congratulations, ${studentName}!*`,
    ``,
    `Your registration for *${courseTitle}* (${moduleName}) has been officially *APPROVED* at Emerging Edge School of Technology!`,
    ``,
    `📩 *Portal Credentials:*`,
    `Your official Portal Login ID, Password, and access instructions have been sent to your registered email: *${email}*.`,
    ``,
    `👉 *Action Required:*`,
    `Please check your Email Inbox (including Spam / Junk folder) to retrieve your login password and access your dashboard.`,
    ``,
    `Welcome aboard! 🚀`,
    `— *Emerging Edge School of Technology*`,
  ].join("\n");

  // Ensure zero links are present
  assertZeroLinks(message);

  return message;
}

/**
 * Sends a WhatsApp chat message via UltraMsg API
 */
export async function sendUltraMsgChatMessage(params: {
  to: string;
  body: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Automated WhatsApp network dispatch has been disabled in favor of manual staff template sending.
  return {
    success: false,
    error: "Automated WhatsApp sending has been disabled. Please use manual staff templates.",
  };
}

/**
 * High-level helper to send approval notification to student's WhatsApp number.
 * Non-blocking and fails gracefully if UltraMsg is unreachable.
 */
export async function sendApprovalWhatsAppNotification(
  params: SendApprovalWhatsAppParams
): Promise<{ sent: boolean; messageId?: string; error?: string }> {
  if (!params.whatsapp) {
    return {
      sent: false,
      error: "No WhatsApp number provided on enrollment record",
    };
  }

  const programMeta = getProgramBySlug(params.program);
  const courseTitle = programMeta?.title ?? params.program;
  const moduleName = params.level && params.level.trim() ? params.level.trim() : programMeta?.level ?? "Module 1";

  const messageBody = formatApprovalWhatsAppMessage({
    studentName: params.fullName.trim(),
    courseTitle,
    moduleName,
    email: params.email.trim(),
  });

  const res = await sendUltraMsgChatMessage({
    to: params.whatsapp,
    body: messageBody,
  });

  return {
    sent: res.success,
    messageId: res.messageId,
    error: res.error,
  };
}
