/** Normalize Pakistani numbers to E.164 (+92...) for display and Meta API. */
export function formatWhatsAppNumberE164(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("0092") && digits.length === 14) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("92") && digits.length === 12) {
    return `+${digits}`;
  }

  if (digits.startsWith("0") && digits.length === 11) {
    return `+92${digits.slice(1)}`;
  }

  if (digits.length === 10 && !digits.startsWith("0")) {
    return `+92${digits}`;
  }

  if (digits.startsWith("92") && digits.length > 12) {
    return `+${digits.slice(0, 12)}`;
  }

  return null;
}

/** Meta Cloud API expects digits only without + prefix. */
export function formatWhatsAppWaId(phone: string): string | null {
  const e164 = formatWhatsAppNumberE164(phone);
  if (!e164) return null;
  return e164.replace(/\D/g, "");
}

export function waIdToE164(waId: string): string {
  const digits = waId.replace(/\D/g, "");
  return digits.startsWith("+") ? digits : `+${digits}`;
}
