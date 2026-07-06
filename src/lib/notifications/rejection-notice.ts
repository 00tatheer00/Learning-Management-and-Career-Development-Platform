import { getProgramBySlug } from "@/lib/data/programs";
import { sendRejectionWhatsApp } from "@/lib/notifications/whatsapp";
import { SITE_CONFIG } from "@/lib/constants";
import { FOUNDER_LINKEDIN_DISPLAY } from "@/lib/constants/contact";

interface RejectionNoticeInput {
  fullName: string;
  email: string;
  whatsapp: string;
  program: string;
  level: string;
  reason?: string;
}

function buildRejectionText(input: RejectionNoticeInput): string {
  const program = getProgramBySlug(input.program);
  const courseName = program?.title ?? input.program;
  const programLevel = program?.level ?? "—";
  const reason = input.reason?.trim() || "Your application could not be approved at this time.";

  return [
    `Dear ${input.fullName},`,
    "",
    "Thank you for applying to Emerging Edge School of Technology.",
    "",
    `Course: ${courseName}`,
    `Module: ${input.level}`,
    `Level: ${programLevel}`,
    "",
    "Unfortunately, your registration has not been approved.",
    "",
    `Reason: ${reason}`,
    "",
    `If you have questions, contact us on WhatsApp ${SITE_CONFIG.whatsapp}.`,
    "",
    `Follow: ${FOUNDER_LINKEDIN_DISPLAY}`,
    "",
    "— EEST Team",
  ].join("\n");
}

export async function sendRejectionNotifications(
  input: RejectionNoticeInput
): Promise<{ whatsappSent: boolean; warnings: string[] }> {
  const warnings: string[] = [];

  const whatsappMessage = `❌ *EEST Registration Update*\n\n${buildRejectionText(input)}`;
  const whatsappResult = await sendRejectionWhatsApp(input.whatsapp, whatsappMessage);

  if (!whatsappResult.sent && whatsappResult.error) {
    warnings.push(`Rejection WhatsApp failed: ${whatsappResult.error}`);
  }

  return { whatsappSent: whatsappResult.sent, warnings };
}
