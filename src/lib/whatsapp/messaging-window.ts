export const WHATSAPP_MESSAGING_WINDOW_MS = 24 * 60 * 60 * 1000;

export function isWithinWhatsAppMessagingWindow(lastInboundAt: Date | null | undefined): boolean {
  if (!lastInboundAt) return false;
  return Date.now() - lastInboundAt.getTime() < WHATSAPP_MESSAGING_WINDOW_MS;
}

export function formatWhatsAppDeliveryError(error: string | null | undefined): string {
  if (!error?.trim()) return "";
  if (/re-engagement/i.test(error)) {
    return "Meta ne block kiya: is number ne 24 ghante mein aapko message nahi kiya. Pehle unse business number par message karwao, ya approved template bhejo.";
  }
  if (/131047/.test(error)) {
    return "24-hour window khatam — free text nahi ja sakta. Template use karo ya customer se pehle message karwao.";
  }
  return error;
}
