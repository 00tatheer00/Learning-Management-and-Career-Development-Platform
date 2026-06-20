export const OFFICIAL_WHATSAPP_NUMBER = "03374005515";

/** Official class WhatsApp group — shown to approved students in the portal */
export const STUDENT_WHATSAPP_GROUP_NAME = "EEST General Group";
export const STUDENT_WHATSAPP_GROUP_URL =
  process.env.NEXT_PUBLIC_STUDENT_WHATSAPP_GROUP_URL ??
  "https://chat.whatsapp.com/KH12eShkV5t3UeF2POdxzZ";

export const OFFICIAL_PHONE_DISPLAY = "+92 337 4005515";

export const OFFICIAL_HELP_MESSAGE =
  "Assalam o Alaikum! I need help with registration at Emerging Edge School of Technology.";

export function getOfficialWhatsAppUrl(
  message: string = OFFICIAL_HELP_MESSAGE
): string {
  const digits = OFFICIAL_WHATSAPP_NUMBER.replace(/^0/, "");
  return `https://wa.me/92${digits}?text=${encodeURIComponent(message)}`;
}

export function getOfficialTelHref(): string {
  return `tel:+92${OFFICIAL_WHATSAPP_NUMBER.replace(/^0/, "")}`;
}
