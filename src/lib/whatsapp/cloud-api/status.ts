import { getWhatsAppCloudConfig } from "@/lib/whatsapp/config";
import { graphWhatsAppFetch } from "@/lib/whatsapp/cloud-api/graph";

interface PhoneNumberResponse {
  id?: string;
  display_phone_number?: string;
  verified_name?: string;
  quality_rating?: string;
  platform_type?: string;
  throughput?: { level?: string };
}

export async function getCloudPhoneNumberStatus(): Promise<{
  configured: boolean;
  connected: boolean;
  phoneNumber?: string;
  verifiedName?: string;
  qualityRating?: string;
  error?: string;
}> {
  const config = getWhatsAppCloudConfig();
  if (!config) {
    return {
      configured: false,
      connected: false,
      error:
        "Set WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_WEBHOOK_VERIFY_TOKEN, and WHATSAPP_APP_SECRET",
    };
  }

  const result = await graphWhatsAppFetch<PhoneNumberResponse>(
    `/${config.phoneNumberId}?fields=display_phone_number,verified_name,quality_rating,platform_type`
  );

  if (!result.ok) {
    return {
      configured: true,
      connected: false,
      error: result.error ?? "Could not verify Meta WhatsApp connection",
    };
  }

  return {
    configured: true,
    connected: true,
    phoneNumber: result.data.display_phone_number,
    verifiedName: result.data.verified_name,
    qualityRating: result.data.quality_rating,
  };
}
