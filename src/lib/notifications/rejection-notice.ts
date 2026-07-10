import { getProgramBySlug } from "@/lib/data/programs";
import {
  buildRejectionTemplatePreview,
  type RejectionTemplateParams,
} from "@/lib/notifications/approval-templates";
import { sendRejectionWhatsApp } from "@/lib/notifications/whatsapp";

interface RejectionNoticeInput {
  fullName: string;
  email: string;
  whatsapp: string;
  program: string;
  level: string;
  reason?: string;
}

export async function sendRejectionNotifications(
  input: RejectionNoticeInput
): Promise<{ whatsappSent: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  const program = getProgramBySlug(input.program);
  const courseName = program?.title ?? input.program;
  const reason = input.reason?.trim() || "Your application could not be approved at this time.";

  const params: RejectionTemplateParams = {
    fullName: input.fullName,
    courseName,
    reason,
  };

  const whatsappResult = await sendRejectionWhatsApp(input.whatsapp, {
    params,
    loggedBody: buildRejectionTemplatePreview(params),
  });

  if (!whatsappResult.sent && whatsappResult.error) {
    warnings.push(`Rejection WhatsApp failed: ${whatsappResult.error}`);
  }

  return { whatsappSent: whatsappResult.sent, warnings };
}
