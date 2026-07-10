import { getWhatsAppCloudConfig } from "@/lib/whatsapp/config";
import { graphWhatsAppFetch } from "@/lib/whatsapp/cloud-api/graph";

interface CloudSendResponse {
  messaging_product?: string;
  contacts?: Array<{ input: string; wa_id: string }>;
  messages?: Array<{ id: string }>;
}

export async function sendCloudTextMessage(input: {
  to: string;
  body: string;
}): Promise<{ sent: boolean; wamid?: string; error?: string }> {
  const config = getWhatsAppCloudConfig();
  if (!config) {
    return { sent: false, error: "WhatsApp Cloud API is not configured" };
  }

  const result = await graphWhatsAppFetch<CloudSendResponse>(
    `/${config.phoneNumberId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: input.to.replace(/\D/g, ""),
        type: "text",
        text: {
          preview_url: input.body.includes("http"),
          body: input.body,
        },
      }),
    }
  );

  if (!result.ok) {
    return { sent: false, error: result.error ?? "Failed to send WhatsApp message" };
  }

  const wamid = result.data.messages?.[0]?.id;
  if (!wamid) {
    return { sent: false, error: "Meta accepted the request but returned no message id" };
  }

  return { sent: true, wamid };
}
