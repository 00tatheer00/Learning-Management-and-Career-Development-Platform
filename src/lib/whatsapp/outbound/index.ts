import { isWhatsAppCloudConfigured } from "@/lib/whatsapp/config";
import { sendCloudHelloWorldTestMessage, sendCloudTextMessage } from "@/lib/whatsapp/cloud-api/send";
import {
  sendCloudRegistrationApprovedTemplate,
  sendCloudRegistrationRejectedTemplate,
} from "@/lib/whatsapp/cloud-api/templates";
import { recordOutboundWhatsAppMessage } from "@/lib/whatsapp/crm/outbound";
import { formatWhatsAppWaId } from "@/lib/whatsapp/phone";
import type {
  ApprovalTemplateParams,
  RejectionTemplateParams,
} from "@/lib/notifications/approval-templates";
import { BUSINESS_WHATSAPP_DISPLAY } from "@/lib/constants/contact";

export type { ApprovalTemplateParams, RejectionTemplateParams };

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

  const isTest = input.purpose === "test";
  const result = isTest
    ? await sendCloudHelloWorldTestMessage({ to: waId })
    : await sendCloudTextMessage({ to: waId, body: input.body });

  if (!result.sent) {
    return result;
  }

  const loggedBody = isTest
    ? "[hello_world template] EEST portal WhatsApp test"
    : input.body;

  if (!input.skipCrmLog) {
    const logged = await recordOutboundWhatsAppMessage({
      phone: input.phone,
      waId,
      body: loggedBody,
      wamid: result.wamid,
      purpose: input.purpose,
      sentByAgentId: input.agentId ?? null,
      sentByAgentName: input.agentName ?? null,
    });
    return { ...result, messageId: logged?.messageId };
  }

  return result;
}

export async function sendWhatsAppApprovalTemplateOutbound(input: {
  phone: string;
  params: ApprovalTemplateParams;
  loggedBody: string;
}): Promise<{ sent: boolean; error?: string; wamid?: string; messageId?: string }> {
  if (!isWhatsAppCloudConfigured()) {
    return { sent: false, error: "WhatsApp Cloud API is not configured on the server" };
  }

  const waId = formatWhatsAppWaId(input.phone);
  if (!waId) {
    return {
      sent: false,
      error: `Invalid WhatsApp number "${input.phone}". Use 03XXXXXXXXX format.`,
    };
  }

  const result = await sendCloudRegistrationApprovedTemplate({
    to: waId,
    firstName: input.params.firstName,
    courseName: input.params.courseName,
    module: input.params.module,
  });

  if (!result.sent) return result;

  const logged = await recordOutboundWhatsAppMessage({
    phone: input.phone,
    waId,
    body: input.loggedBody,
    wamid: result.wamid,
    purpose: "approval",
  });

  return { ...result, messageId: logged?.messageId };
}

export async function sendWhatsAppRejectionTemplateOutbound(input: {
  phone: string;
  params: RejectionTemplateParams;
  loggedBody: string;
}): Promise<{ sent: boolean; error?: string; wamid?: string; messageId?: string }> {
  if (!isWhatsAppCloudConfigured()) {
    return { sent: false, error: "WhatsApp Cloud API is not configured on the server" };
  }

  const waId = formatWhatsAppWaId(input.phone);
  if (!waId) {
    return {
      sent: false,
      error: `Invalid WhatsApp number "${input.phone}". Use 03XXXXXXXXX format.`,
    };
  }

  const result = await sendCloudRegistrationRejectedTemplate({
    to: waId,
    fullName: input.params.fullName,
    courseName: input.params.courseName,
    reason: input.params.reason,
    businessWhatsAppDisplay: BUSINESS_WHATSAPP_DISPLAY,
  });

  if (!result.sent) return result;

  const logged = await recordOutboundWhatsAppMessage({
    phone: input.phone,
    waId,
    body: input.loggedBody,
    wamid: result.wamid,
    purpose: "rejection",
  });

  return { ...result, messageId: logged?.messageId };
}
