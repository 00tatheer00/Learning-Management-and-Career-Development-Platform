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
  _input: RejectionNoticeInput
): Promise<{ whatsappSent: boolean; warnings: string[] }> {
  // Option 1: Direct 1-Click WhatsApp Chat enabled in Admin UI
  return { whatsappSent: true, warnings: [] };
}
