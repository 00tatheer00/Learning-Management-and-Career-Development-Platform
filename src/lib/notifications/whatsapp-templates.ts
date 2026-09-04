import { getPortalLoginUrl } from "@/lib/site-url";

/**
 * Sanitizes phone numbers into standard international format for WhatsApp.
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
 * Constructs a direct wa.me link with pre-filled message text.
 */
export function buildWhatsAppChatUrl(phone?: string | null, message?: string): string {
  const cleanPhone = sanitizeWhatsAppPhone(phone);
  const encodedText = message ? encodeURIComponent(message) : "";

  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}${encodedText ? `?text=${encodedText}` : ""}`;
  }
  return `https://wa.me/${encodedText ? `?text=${encodedText}` : ""}`;
}

export interface ApprovalWhatsAppParams {
  studentName: string;
  courseTitle: string;
  moduleName?: string;
  email: string;
  password?: string;
  portalUrl?: string;
}

/**
 * Formats the official Approval WhatsApp message template for manual sending.
 */
export function formatApprovalWhatsAppMessage(params: ApprovalWhatsAppParams): string {
  const {
    studentName,
    courseTitle,
    moduleName = "Module 1",
    email,
    password,
    portalUrl = getPortalLoginUrl(),
  } = params;

  const passwordLine = password && password.trim() && password !== "••••••••"
    ? `• Password: *${password.trim()}*`
    : `• Password: *Sent to your registered email (check Inbox & Spam)*`;

  return [
    `🎉 *Congratulations, ${studentName.trim()}!*`,
    ``,
    `Your registration for *${courseTitle.trim()}* (${moduleName.trim()}) has been officially *APPROVED* at Emerging Edge School of Technology!`,
    ``,
    `📩 *Student Portal Login Credentials:*`,
    `• Portal URL: ${portalUrl}`,
    `• Login Email: *${email.trim()}*`,
    passwordLine,
    ``,
    `👉 *Next Steps:*`,
    `1. Log in to your student portal using the credentials above.`,
    `2. Access your course dashboard, live class schedules, and materials.`,
    ``,
    `Welcome aboard! 🚀`,
    `— *Emerging Edge School of Technology*`,
  ].join("\n");
}

export interface RejectionWhatsAppParams {
  studentName: string;
  courseTitle: string;
  moduleName?: string;
  reason?: string;
}

/**
 * Formats the official Rejection WhatsApp message template for manual sending.
 */
export function formatRejectionWhatsAppMessage(params: RejectionWhatsAppParams): string {
  const {
    studentName,
    courseTitle,
    moduleName = "Module 1",
    reason,
  } = params;

  const reasonText = reason && reason.trim()
    ? reason.trim()
    : "Incomplete verification or payment proof could not be verified.";

  return [
    `Dear *${studentName.trim()}*,`,
    ``,
    `Thank you for your interest and registration for the *${courseTitle.trim()}* (${moduleName.trim()}) program at Emerging Edge School of Technology.`,
    ``,
    `We have reviewed your application. Unfortunately, we are unable to approve your registration at this time.`,
    ``,
    `📋 *Reason:*`,
    `${reasonText}`,
    ``,
    `If you have updated payment proof or would like to clarify this, please reply directly to this message or submit a fresh application with valid details.`,
    ``,
    `Best regards,`,
    `*Admissions Team*`,
    `— *Emerging Edge School of Technology*`,
  ].join("\n");
}
