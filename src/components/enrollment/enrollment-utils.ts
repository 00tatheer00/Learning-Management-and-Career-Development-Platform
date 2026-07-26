/**
 * Formats CNIC string as XXXXX-XXXXXXX-X (13 digits)
 */
export function formatCnicInput(value: string): string {
  const digitsOnly = value.replace(/\D/g, "").slice(0, 13);
  if (digitsOnly.length <= 5) return digitsOnly;
  if (digitsOnly.length <= 12) {
    return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5)}`;
  }
  return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 12)}-${digitsOnly.slice(12)}`;
}

/**
 * Formats Pakistani mobile/WhatsApp string as 03XX-XXXXXXX (11 digits)
 */
export function formatWhatsappInput(value: string): string {
  const digitsOnly = value.replace(/\D/g, "");
  let cleaned = digitsOnly;
  if (cleaned.startsWith("92")) {
    cleaned = "0" + cleaned.slice(2);
  }
  cleaned = cleaned.slice(0, 11);
  if (cleaned.length <= 4) return cleaned;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
}

export const DRAFT_STORAGE_KEY = "eest_registration_form_draft_v2";
