export interface WhatsAppCloudConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken: string;
  appSecret: string;
  apiVersion: string;
}

export function getWhatsAppWebhookVerifyToken(): string | null {
  return process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim() ?? null;
}

export function getWhatsAppCloudConfig(): WhatsAppCloudConfig | null {
  const accessToken =
    process.env.WHATSAPP_ACCESS_TOKEN?.trim() ??
    process.env.WHATSAPP_CLOUD_API_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim();
  const webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim();
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim();
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || "v21.0";

  if (!accessToken || !phoneNumberId || !webhookVerifyToken || !appSecret) {
    return null;
  }

  return {
    accessToken,
    phoneNumberId,
    businessAccountId: businessAccountId ?? "",
    webhookVerifyToken,
    appSecret,
    apiVersion,
  };
}

export function getWhatsAppGraphBaseUrl(apiVersion: string): string {
  return `https://graph.facebook.com/${apiVersion}`;
}

export function isWhatsAppCloudConfigured(): boolean {
  return getWhatsAppCloudConfig() !== null;
}
