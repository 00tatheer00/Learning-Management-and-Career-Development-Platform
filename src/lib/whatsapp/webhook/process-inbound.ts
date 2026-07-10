import { prisma } from "@/lib/prisma";
import { whatsappLogger } from "@/lib/whatsapp/logger";
import {
  buildMessagePreview,
  findOrCreateWhatsAppContact,
  findOrCreateWhatsAppConversation,
  mapInboundMessageType,
} from "@/lib/whatsapp/crm/contacts";
import type {
  WhatsAppInboundMessage,
  WhatsAppMessageStatusUpdate,
  WhatsAppWebhookChangeValue,
} from "@/lib/whatsapp/webhook/types";

function parseWebhookTimestamp(timestamp: string): Date {
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds)) return new Date();
  return new Date(seconds * 1000);
}

function extractInboundFields(message: WhatsAppInboundMessage) {
  const type = mapInboundMessageType(message.type);

  if (type === "text") {
    return { type, body: message.text?.body ?? null };
  }

  if (type === "image") {
    return {
      type,
      body: message.image?.caption ?? null,
      mediaId: message.image?.id ?? null,
      mediaMimeType: message.image?.mime_type ?? null,
      mediaSha256: message.image?.sha256 ?? null,
    };
  }

  if (type === "document") {
    return {
      type,
      body: message.document?.caption ?? null,
      mediaId: message.document?.id ?? null,
      mediaMimeType: message.document?.mime_type ?? null,
      mediaFilename: message.document?.filename ?? null,
      mediaSha256: message.document?.sha256 ?? null,
    };
  }

  if (type === "audio") {
    return {
      type,
      mediaId: message.audio?.id ?? null,
      mediaMimeType: message.audio?.mime_type ?? null,
      mediaSha256: message.audio?.sha256 ?? null,
    };
  }

  if (type === "video") {
    return {
      type,
      body: message.video?.caption ?? null,
      mediaId: message.video?.id ?? null,
      mediaMimeType: message.video?.mime_type ?? null,
      mediaSha256: message.video?.sha256 ?? null,
    };
  }

  if (type === "sticker") {
    return {
      type,
      mediaId: message.sticker?.id ?? null,
      mediaMimeType: message.sticker?.mime_type ?? null,
      mediaSha256: message.sticker?.sha256 ?? null,
    };
  }

  if (type === "location") {
    return {
      type,
      locationLat: message.location?.latitude ?? null,
      locationLng: message.location?.longitude ?? null,
      locationName: message.location?.name ?? null,
      locationAddress: message.location?.address ?? null,
      body: message.location?.name ?? message.location?.address ?? "Location",
    };
  }

  if (type === "contacts") {
    return {
      type,
      contactsJson: JSON.stringify(message.contacts ?? []),
      body: "Contact card",
    };
  }

  if (type === "reaction") {
    return {
      type,
      reactionEmoji: message.reaction?.emoji ?? null,
      reactionTargetWamid: message.reaction?.message_id ?? null,
      body: message.reaction?.emoji ?? "Reaction",
    };
  }

  return { type, body: `[${message.type}]` };
}

export async function processInboundWhatsAppMessage(input: {
  message: WhatsAppInboundMessage;
  value: WhatsAppWebhookChangeValue;
}): Promise<{ stored: boolean; messageId?: string }> {
  const { message, value } = input;

  const existing = await prisma.whatsAppMessage.findUnique({
    where: { wamid: message.id },
    select: { id: true },
  });
  if (existing) {
    return { stored: false, messageId: existing.id };
  }

  const profileName =
    value.contacts?.find((contact) => contact.wa_id === message.from)?.profile?.name ?? null;

  const contact = await findOrCreateWhatsAppContact({
    waId: message.from,
    profileName,
  });

  if (contact.isBlocked) {
    whatsappLogger.info("Inbound message ignored for blocked contact", { waId: message.from });
    return { stored: false };
  }

  const conversation = await findOrCreateWhatsAppConversation(contact.id);
  const fields = extractInboundFields(message);
  const createdAt = parseWebhookTimestamp(message.timestamp);
  const preview = buildMessagePreview(fields.type, fields.body);

  const record = await prisma.whatsAppMessage.create({
    data: {
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      contactId: contact.id,
      wamid: message.id,
      direction: "inbound",
      type: fields.type,
      body: fields.body ?? null,
      mediaId: "mediaId" in fields ? fields.mediaId ?? null : null,
      mediaMimeType: "mediaMimeType" in fields ? fields.mediaMimeType ?? null : null,
      mediaFilename: "mediaFilename" in fields ? fields.mediaFilename ?? null : null,
      mediaSha256: "mediaSha256" in fields ? fields.mediaSha256 ?? null : null,
      locationLat: "locationLat" in fields ? fields.locationLat ?? null : null,
      locationLng: "locationLng" in fields ? fields.locationLng ?? null : null,
      locationName: "locationName" in fields ? fields.locationName ?? null : null,
      locationAddress: "locationAddress" in fields ? fields.locationAddress ?? null : null,
      contactsJson: "contactsJson" in fields ? fields.contactsJson ?? null : null,
      reactionEmoji: "reactionEmoji" in fields ? fields.reactionEmoji ?? null : null,
      reactionTargetWamid:
        "reactionTargetWamid" in fields ? fields.reactionTargetWamid ?? null : null,
      status: "delivered",
      createdAt,
      deliveredAt: createdAt,
    },
  });

  await prisma.whatsAppConversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: createdAt,
      lastMessagePreview: preview,
      unreadCount: { increment: 1 },
      status: conversation.status === "archived" ? "open" : conversation.status,
      updatedAt: new Date(),
    },
  });

  whatsappLogger.info("Inbound WhatsApp message stored", {
    wamid: message.id,
    contactId: contact.id,
    type: fields.type,
  });

  return { stored: true, messageId: record.id };
}

export async function processWhatsAppStatusUpdate(
  status: WhatsAppMessageStatusUpdate
): Promise<boolean> {
  const existing = await prisma.whatsAppMessage.findUnique({
    where: { wamid: status.id },
    select: { id: true, status: true },
  });

  if (!existing) {
    whatsappLogger.warn("Status update for unknown message", { wamid: status.id, status: status.status });
    return false;
  }

  const at = parseWebhookTimestamp(status.timestamp);
  const errorText =
    status.errors?.map((err) => err.message ?? err.title).filter(Boolean).join("; ") ?? null;

  const data: {
    status: "sent" | "delivered" | "read" | "failed";
    statusError?: string | null;
    sentAt?: Date;
    deliveredAt?: Date;
    readAt?: Date;
    failedAt?: Date;
    updatedAt: Date;
  } = {
    status: status.status,
    updatedAt: new Date(),
  };

  if (status.status === "sent") data.sentAt = at;
  if (status.status === "delivered") data.deliveredAt = at;
  if (status.status === "read") data.readAt = at;
  if (status.status === "failed") {
    data.failedAt = at;
    data.statusError = errorText;
  }

  await prisma.whatsAppMessage.update({
    where: { id: existing.id },
    data,
  });

  return true;
}
