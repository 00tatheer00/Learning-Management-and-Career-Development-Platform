import { SITE_CONFIG } from "@/lib/constants";
import { getProgramBySlug } from "@/lib/data/programs";
import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp";
import { formatAppliedDateTime } from "@/lib/utils";

const DEFAULT_ADMIN_ALERT_WHATSAPP = "03115969527";

export interface NewRegistrationAlertInput {
  fullName: string;
  email: string;
  whatsapp: string;
  program: string;
  level: string;
  batch: string;
  institution: string;
  createdAt: string;
  enrollmentId: string;
}

function getAdminAlertWhatsApp(): string {
  return process.env.ADMIN_ALERT_WHATSAPP?.trim() || DEFAULT_ADMIN_ALERT_WHATSAPP;
}

function buildAdminAlertText(input: NewRegistrationAlertInput): string {
  const courseName = getProgramBySlug(input.program)?.title ?? input.program;
  const adminUrl = `${SITE_CONFIG.url}/admin/enrollments`;

  return [
    "New EEST Registration",
    "",
    `Name: ${input.fullName}`,
    `Email: ${input.email}`,
    `WhatsApp: ${input.whatsapp}`,
    `Course: ${courseName}`,
    `Module: ${input.level}`,
    `Batch: ${input.batch}`,
    `Institution: ${input.institution}`,
    `Applied: ${formatAppliedDateTime(input.createdAt)}`,
    "",
    `Review now: ${adminUrl}`,
  ].join("\n");
}

export async function sendAdminNewRegistrationAlert(
  input: NewRegistrationAlertInput
): Promise<{ whatsappSent: boolean; warnings: string[] }> {
  const warnings: string[] = [];

  const whatsappResult = await sendWhatsAppMessage(
    getAdminAlertWhatsApp(),
    `🆕 *New EEST Registration*\n\n${buildAdminAlertText(input)}`
  );

  if (whatsappResult.error) {
    warnings.push(`Admin WhatsApp failed: ${whatsappResult.error}`);
  }

  return { whatsappSent: whatsappResult.sent, warnings };
}
