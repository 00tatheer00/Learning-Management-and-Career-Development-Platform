import { getProgramBySlug } from "@/lib/data/programs";
import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp";
import { SITE_CONFIG } from "@/lib/constants";

interface RejectionNoticeInput {
  fullName: string;
  email: string;
  whatsapp: string;
  program: string;
  level: string;
  reason?: string;
}

function buildRejectionText(input: RejectionNoticeInput): string {
  const courseName = getProgramBySlug(input.program)?.title ?? input.program;
  const reason = input.reason?.trim() || "Your application could not be approved at this time.";

  return [
    `Dear ${input.fullName},`,
    "",
    `Thank you for applying to EEST for ${courseName} (${input.level}).`,
    "",
    "Unfortunately, your registration has not been approved.",
    "",
    `Reason: ${reason}`,
    "",
    `If you have questions, contact us on WhatsApp ${SITE_CONFIG.whatsapp}.`,
    "",
    "— Emerging Edge Summer Training",
  ].join("\n");
}

export async function sendRejectionNotifications(
  input: RejectionNoticeInput
): Promise<{ whatsappSent: boolean; warnings: string[] }> {
  const warnings: string[] = [];

  const whatsappMessage = `❌ *EEST Registration Update*\n\n${buildRejectionText(input)}`;
  const whatsappResult = await sendWhatsAppMessage(input.whatsapp, whatsappMessage);

  if (!whatsappResult.sent && whatsappResult.error) {
    warnings.push(`Rejection WhatsApp failed: ${whatsappResult.error}`);
  }

  return { whatsappSent: whatsappResult.sent, warnings };
}
