import type { WhatsAppMessageType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { waIdToE164 } from "@/lib/whatsapp/phone";

export async function resolveContactRecordLinks(waId: string): Promise<{
  userId: string | null;
  enrollmentId: string | null;
}> {
  const phoneE164 = waIdToE164(waId);
  const digits = waId.replace(/\D/g, "");
  const local = digits.startsWith("92") ? `0${digits.slice(2)}` : null;

  const [user, enrollment] = await Promise.all([
    prisma.user.findFirst({
      where: {
        OR: [
          { phone: phoneE164 },
          { phone: local ?? undefined },
          { phone: { contains: digits.slice(-10) } },
        ],
      },
      select: { id: true },
    }),
    prisma.enrollment.findFirst({
      where: {
        OR: [
          { whatsapp: phoneE164 },
          { whatsapp: local ?? undefined },
          { whatsapp: { contains: digits.slice(-10) } },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    }),
  ]);

  return {
    userId: user?.id ?? null,
    enrollmentId: enrollment?.id ?? null,
  };
}

export async function findOrCreateWhatsAppContact(input: {
  waId: string;
  profileName?: string | null;
}) {
  const phoneE164 = waIdToE164(input.waId);
  const existing = await prisma.whatsAppContact.findUnique({
    where: { waId: input.waId },
  });

  if (existing) {
    if (input.profileName && input.profileName !== existing.profileName) {
      return prisma.whatsAppContact.update({
        where: { id: existing.id },
        data: {
          profileName: input.profileName,
          displayName: existing.displayName ?? input.profileName,
          updatedAt: new Date(),
        },
      });
    }
    return existing;
  }

  const links = await resolveContactRecordLinks(input.waId);

  return prisma.whatsAppContact.create({
    data: {
      id: crypto.randomUUID(),
      waId: input.waId,
      phoneE164,
      profileName: input.profileName ?? null,
      displayName: input.profileName ?? null,
      userId: links.userId,
      enrollmentId: links.enrollmentId,
    },
  });
}

export async function findOrCreateWhatsAppConversation(contactId: string) {
  const existing = await prisma.whatsAppConversation.findUnique({
    where: { contactId },
  });
  if (existing) return existing;

  return prisma.whatsAppConversation.create({
    data: {
      id: crypto.randomUUID(),
      contactId,
      status: "open",
      unreadCount: 0,
    },
  });
}

export function mapInboundMessageType(type: string): WhatsAppMessageType {
  switch (type) {
    case "text":
      return "text";
    case "image":
      return "image";
    case "document":
      return "document";
    case "audio":
      return "audio";
    case "video":
      return "video";
    case "sticker":
      return "sticker";
    case "location":
      return "location";
    case "contacts":
      return "contacts";
    case "reaction":
      return "reaction";
    case "interactive":
      return "interactive";
    case "template":
      return "template";
    default:
      return "unknown";
  }
}

export function buildMessagePreview(type: WhatsAppMessageType, body?: string | null): string {
  if (type === "text" && body?.trim()) return body.trim().slice(0, 160);
  const labels: Record<WhatsAppMessageType, string> = {
    text: "Message",
    image: "Image",
    document: "Document",
    audio: "Audio",
    video: "Video",
    sticker: "Sticker",
    location: "Location",
    contacts: "Contact",
    template: "Template",
    interactive: "Interactive",
    reaction: "Reaction",
    unknown: "Message",
  };
  return labels[type];
}
