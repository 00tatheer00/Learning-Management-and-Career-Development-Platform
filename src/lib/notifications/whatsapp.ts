import {
  sendWhatsAppOutbound,
  sendWhatsAppApprovalTemplateOutbound,
  sendWhatsAppRejectionTemplateOutbound,
  type WhatsAppPurpose,
} from "@/lib/whatsapp/outbound";
import type {
  ApprovalTemplateParams,
  RejectionTemplateParams,
} from "@/lib/notifications/approval-templates";
import { getCloudPhoneNumberStatus } from "@/lib/whatsapp/cloud-api/status";
import { isWhatsAppCloudConfigured } from "@/lib/whatsapp/config";

export type { WhatsAppPurpose };

export async function getWhatsAppConnectionStatus(): Promise<{
  configured: boolean;
  connected: boolean;
  webhookUrl: string;
  phoneNumber?: string;
  verifiedName?: string;
  qualityRating?: string;
  error?: string;
}> {
  const cloud = await getCloudPhoneNumberStatus();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://school.emergingedge.tech";

  return {
    configured: cloud.configured,
    connected: cloud.connected,
    webhookUrl: `${siteUrl}/api/webhooks/whatsapp`,
    phoneNumber: cloud.phoneNumber,
    verifiedName: cloud.verifiedName,
    qualityRating: cloud.qualityRating,
    error: cloud.error,
  };
}

export async function sendApprovalWhatsApp(
  phone: string,
  input: { params: ApprovalTemplateParams; loggedBody: string }
): Promise<{ sent: boolean; error?: string }> {
  return sendWhatsAppApprovalTemplateOutbound({
    phone,
    params: input.params,
    loggedBody: input.loggedBody,
  });
}

export async function sendRejectionWhatsApp(
  phone: string,
  input: { params: RejectionTemplateParams; loggedBody: string }
): Promise<{ sent: boolean; error?: string }> {
  return sendWhatsAppRejectionTemplateOutbound({
    phone,
    params: input.params,
    loggedBody: input.loggedBody,
  });
}

export async function sendLoginResendWhatsApp(
  phone: string,
  message: string
): Promise<{ sent: boolean; error?: string }> {
  return sendWhatsAppMessage(phone, message, "login_resend");
}

export async function sendForgotPasswordWhatsApp(
  phone: string,
  message: string
): Promise<{ sent: boolean; error?: string }> {
  return sendWhatsAppMessage(phone, message, "forgot_password");
}

export async function sendPasswordResetWhatsApp(
  phone: string,
  message: string
): Promise<{ sent: boolean; error?: string }> {
  return sendWhatsAppMessage(phone, message, "password_reset");
}

export async function sendAssignmentReviewWhatsApp(
  phone: string,
  message: string
): Promise<{ sent: boolean; error?: string }> {
  return sendWhatsAppMessage(phone, message, "assignment_review");
}

export async function sendWhatsAppMessage(
  phone: string,
  message: string,
  purpose?: WhatsAppPurpose
): Promise<{ sent: boolean; error?: string; wamid?: string }> {
  if (!isWhatsAppCloudConfigured()) {
    return {
      sent: false,
      error: "WhatsApp Cloud API is not configured on the server",
    };
  }

  return sendWhatsAppOutbound({ phone, body: message, purpose });
}
