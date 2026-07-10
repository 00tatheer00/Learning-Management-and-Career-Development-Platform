import { prisma } from "@/lib/prisma";
import { formatWhatsAppWaId, waIdToE164 } from "@/lib/whatsapp/phone";
import {
  buildMessagePreview,
  findOrCreateWhatsAppContact,
  findOrCreateWhatsAppConversation,
} from "@/lib/whatsapp/crm/contacts";

export async function recordOutboundWhatsAppMessage(input: {
  phone: string;
  waId?: string;
  body: string;
  wamid?: string;
  purpose?: string | null;
  sentByAgentId?: string | null;
  sentByAgentName?: string | null;
  clientMessageId?: string;
}): Promise<{ conversationId: string; messageId: string } | null> {
  const waId = input.waId ?? formatWhatsAppWaId(input.phone);
  if (!waId) return null;

  const contact = await findOrCreateWhatsAppContact({ waId });
  const conversation = await findOrCreateWhatsAppConversation(contact.id);
  const now = new Date();
  const preview = buildMessagePreview("text", input.body);

  const record = await prisma.whatsAppMessage.create({
    data: {
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      contactId: contact.id,
      wamid: input.wamid ?? null,
      clientMessageId: input.clientMessageId ?? crypto.randomUUID(),
      direction: "outbound",
      type: "text",
      body: input.body,
      status: input.wamid ? "sent" : "pending",
      purpose: input.purpose ?? null,
      sentByAgentId: input.sentByAgentId ?? null,
      sentByAgentName: input.sentByAgentName ?? null,
      sentAt: now,
      createdAt: now,
    },
  });

  await prisma.whatsAppConversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: now,
      lastMessagePreview: preview,
      updatedAt: now,
    },
  });

  return { conversationId: conversation.id, messageId: record.id };
}

export async function recordAgentReply(input: {
  conversationId: string;
  body: string;
  wamid?: string;
  agentId: string;
  agentName: string;
}): Promise<{ messageId: string }> {
  const conversation = await prisma.whatsAppConversation.findUnique({
    where: { id: input.conversationId },
    include: { contact: true },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const now = new Date();
  const preview = buildMessagePreview("text", input.body);

  const record = await prisma.whatsAppMessage.create({
    data: {
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      contactId: conversation.contactId,
      wamid: input.wamid ?? null,
      clientMessageId: crypto.randomUUID(),
      direction: "outbound",
      type: "text",
      body: input.body,
      status: input.wamid ? "sent" : "pending",
      sentByAgentId: input.agentId,
      sentByAgentName: input.agentName,
      sentAt: now,
      createdAt: now,
    },
  });

  await prisma.whatsAppConversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: now,
      lastMessagePreview: preview,
      updatedAt: now,
    },
  });

  return { messageId: record.id };
}

export function phoneToWaId(phone: string): string | null {
  return formatWhatsAppWaId(phone) ?? formatWhatsAppWaId(waIdToE164(phone));
}
