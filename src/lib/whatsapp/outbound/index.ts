import { isWhatsAppCloudConfigured } from "@/lib/whatsapp/config";
import { sendCloudTextMessage } from "@/lib/whatsapp/cloud-api/send";
import { recordOutboundWhatsAppMessage } from "@/lib/whatsapp/crm/outbound";
import { formatWhatsAppWaId } from "@/lib/whatsapp/phone";

export type WhatsAppPurpose =
  | "approval"
  | "rejection"
  | "login_resend"
  | "forgot_password"
  | "password_reset"
  | "assignment_review"
  | "agent_reply"
  | "test";

const ALLOWED_WHATSAPP_PURPOSES = new Set<WhatsAppPurpose>([
  "approval",
  "rejection",
  "login_resend",
  "forgot_password",
  "password_reset",
  "assignment_review",
  "agent_reply",
  "test",
]);

const WHATSAPP_BLOCKED_MESSAGE =
  "This WhatsApp message type is disabled. Allowed: approve, reject, login resend, password reset, assignment review, agent reply, test.";

export async function sendWhatsAppOutbound(input: {
  phone: string;
  body: string;
  purpose?: WhatsAppPurpose;
  agentId?: string;
  agentName?: string;
  skipCrmLog?: boolean;
}): Promise<{ sent: boolean; error?: string; wamid?: string; messageId?: string }> {
  if (!input.purpose || !ALLOWED_WHATSAPP_PURPOSES.has(input.purpose)) {
    console.info("[whatsapp] blocked send:", input.purpose ?? "unspecified");
    return { sent: false, error: WHATSAPP_BLOCKED_MESSAGE };
  }

  if (!isWhatsAppCloudConfigured()) {
    return {
      sent: false,
      error: "WhatsApp Cloud API is not configured on the server",
    };
  }

  const waId = formatWhatsAppWaId(input.phone);
  if (!waId) {
    return {
      sent: false,
      error: `Invalid WhatsApp number "${input.phone}". Use 03XXXXXXXXX format.`,
    };
  }

  const result = await sendCloudTextMessage({ to: waId, body: input.body });
  if (!result.sent) {
    return result;
  }

  if (!input.skipCrmLog) {
    const logged = await recordOutboundWhatsAppMessage({
      phone: input.phone,
      waId,
      body: input.body,
      wamid: result.wamid,
      purpose: input.purpose,
      sentByAgentId: input.agentId ?? null,
      sentByAgentName: input.agentName ?? null,
    });
    return { ...result, messageId: logged?.messageId };
  }

  return result;
}
