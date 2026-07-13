import { getWhatsAppCloudConfig } from "@/lib/whatsapp/config";
import { graphWhatsAppFetch } from "@/lib/whatsapp/cloud-api/graph";

interface CloudSendResponse {
  messaging_product?: string;
  contacts?: Array<{ input: string; wa_id: string }>;
  messages?: Array<{ id: string }>;
}

export const WHATSAPP_TEMPLATE_NAMES = {
  registrationApproved: "eest_registration_approved",
  registrationRejected: "eest_registration_rejected",
} as const;

export function getWhatsAppTemplateName(
  key: keyof typeof WHATSAPP_TEMPLATE_NAMES
): string {
  const envKey =
    key === "registrationApproved"
      ? process.env.WHATSAPP_TEMPLATE_APPROVED?.trim()
      : process.env.WHATSAPP_TEMPLATE_REJECTED?.trim();
  return envKey || WHATSAPP_TEMPLATE_NAMES[key];
}

/** Copy-paste bodies for Meta Business Manager → WhatsApp → Message templates */
export const META_TEMPLATE_SUBMISSIONS = {
  eest_registration_approved: {
    category: "UTILITY",
    language: "en",
    body: `Hello {{1}},

Congratulations! Your registration at Emerging Edge School of Technology has been approved.

Course: {{2}}
Module: {{3}}

Your student portal login details have been sent to your registered email. Please check your inbox and spam folder, then log in to the portal.

Welcome to your batch!
EEST Team`,
  },
  eest_registration_rejected: {
    category: "UTILITY",
    language: "en",
    body: `Hello {{1}},

Thank you for applying to Emerging Edge School of Technology.

Course: {{2}}

Unfortunately your registration could not be approved at this time.

Reason: {{3}}

Questions? WhatsApp us on {{4}} or reply here.

EEST Team`,
  },
} as const;

function truncateTemplateParam(value: string, max = 256): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export async function sendCloudTemplateMessage(input: {
  to: string;
  templateName: string;
  languageCode?: string;
  bodyParameters?: string[];
}): Promise<{ sent: boolean; wamid?: string; error?: string }> {
  const config = getWhatsAppCloudConfig();
  if (!config) {
    return { sent: false, error: "WhatsApp Cloud API is not configured" };
  }

  const bodyParameters = (input.bodyParameters ?? []).map((value) =>
    truncateTemplateParam(value)
  );

  const template: Record<string, unknown> = {
    name: input.templateName,
    language: { code: input.languageCode ?? "en" },
  };

  if (bodyParameters.length > 0) {
    template.components = [
      {
        type: "body",
        parameters: bodyParameters.map((text) => ({ type: "text", text })),
      },
    ];
  }

  const result = await graphWhatsAppFetch<CloudSendResponse>(
    `/${config.phoneNumberId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: input.to.replace(/\D/g, ""),
        type: "template",
        template,
      }),
    }
  );

  if (!result.ok) {
    return { sent: false, error: result.error ?? "Failed to send WhatsApp template" };
  }

  const wamid = result.data.messages?.[0]?.id;
  if (!wamid) {
    return { sent: false, error: "Meta accepted the request but returned no message id" };
  }

  return { sent: true, wamid };
}

export async function sendCloudRegistrationApprovedTemplate(input: {
  to: string;
  firstName: string;
  courseName: string;
  module: string;
}): Promise<{ sent: boolean; wamid?: string; error?: string }> {
  return sendCloudTemplateMessage({
    to: input.to,
    templateName: getWhatsAppTemplateName("registrationApproved"),
    bodyParameters: [
      input.firstName,
      input.courseName,
      input.module,
    ],
  });
}

export async function sendCloudRegistrationRejectedTemplate(input: {
  to: string;
  fullName: string;
  courseName: string;
  reason: string;
  businessWhatsAppDisplay: string;
}): Promise<{ sent: boolean; wamid?: string; error?: string }> {
  return sendCloudTemplateMessage({
    to: input.to,
    templateName: getWhatsAppTemplateName("registrationRejected"),
    bodyParameters: [
      input.fullName,
      input.courseName,
      input.reason,
      input.businessWhatsAppDisplay,
    ],
  });
}
