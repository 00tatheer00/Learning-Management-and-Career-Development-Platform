import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp";

const DEFAULT_ADMIN_ALERT_WHATSAPP = "03115969527";

export function getAdminAlertPhone(): string {
  return process.env.ADMIN_ALERT_WHATSAPP?.trim() || DEFAULT_ADMIN_ALERT_WHATSAPP;
}

export async function sendAdminAutomationAlert(message: string): Promise<boolean> {
  const result = await sendWhatsAppMessage(getAdminAlertPhone(), message);
  return result.sent;
}
