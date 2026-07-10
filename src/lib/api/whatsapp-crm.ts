import type { WhatsAppConversationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatWhatsAppWaId } from "@/lib/whatsapp/phone";

export interface WhatsAppConversationRow {
  id: string;
  status: WhatsAppConversationStatus;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  contact: {
    id: string;
    waId: string;
    phoneE164: string;
    displayName: string | null;
    profileName: string | null;
    userId: string | null;
    enrollmentId: string | null;
    isBlocked: boolean;
  };
}

export interface WhatsAppMessageRow {
  id: string;
  direction: "inbound" | "outbound";
  type: string;
  body: string | null;
  status: string;
  purpose: string | null;
  sentByAgentName: string | null;
  createdAt: string;
  deliveredAt: string | null;
  readAt: string | null;
  mediaMimeType: string | null;
  mediaFilename: string | null;
}

type ConversationWithContact = {
  id: string;
  status: WhatsAppConversationStatus;
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  contact: {
    id: string;
    waId: string;
    phoneE164: string;
    displayName: string | null;
    profileName: string | null;
    userId: string | null;
    enrollmentId: string | null;
    isBlocked: boolean;
  };
};

function mapConversation(row: ConversationWithContact): WhatsAppConversationRow {
  return {
    id: row.id,
    status: row.status,
    lastMessageAt: row.lastMessageAt?.toISOString() ?? null,
    lastMessagePreview: row.lastMessagePreview,
    unreadCount: row.unreadCount,
    assignedAgentId: row.assignedAgentId,
    assignedAgentName: row.assignedAgentName,
    contact: row.contact,
  };
}

export async function listWhatsAppConversations(input: {
  status?: WhatsAppConversationStatus | "all";
  search?: string;
  limit?: number;
}): Promise<WhatsAppConversationRow[]> {
  const limit = Math.min(input.limit ?? 80, 200);
  const search = input.search?.trim();

  const rows = await prisma.whatsAppConversation.findMany({
    where: {
      ...(input.status && input.status !== "all" ? { status: input.status } : {}),
      ...(search
        ? {
            OR: [
              { lastMessagePreview: { contains: search, mode: "insensitive" } },
              { contact: { displayName: { contains: search, mode: "insensitive" } } },
              { contact: { profileName: { contains: search, mode: "insensitive" } } },
              { contact: { phoneE164: { contains: search } } },
              { contact: { waId: { contains: search.replace(/\D/g, "") } } },
            ],
          }
        : {}),
    },
    include: { contact: true },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    take: limit,
  });

  return rows.map(mapConversation);
}

export async function getWhatsAppConversationDetail(
  conversationId: string
): Promise<WhatsAppConversationRow | null> {
  const row = await prisma.whatsAppConversation.findUnique({
    where: { id: conversationId },
    include: { contact: true },
  });
  if (!row) return null;
  return mapConversation(row);
}

export async function getWhatsAppConversationMessages(
  conversationId: string,
  input?: { before?: string; limit?: number }
): Promise<WhatsAppMessageRow[]> {
  const limit = Math.min(input?.limit ?? 60, 120);

  const rows = await prisma.whatsAppMessage.findMany({
    where: {
      conversationId,
      isInternalNote: false,
      ...(input?.before ? { createdAt: { lt: new Date(input.before) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows
    .reverse()
    .map((row) => ({
      id: row.id,
      direction: row.direction,
      type: row.type,
      body: row.body,
      status: row.status,
      purpose: row.purpose,
      sentByAgentName: row.sentByAgentName,
      createdAt: row.createdAt.toISOString(),
      deliveredAt: row.deliveredAt?.toISOString() ?? null,
      readAt: row.readAt?.toISOString() ?? null,
      mediaMimeType: row.mediaMimeType,
      mediaFilename: row.mediaFilename,
    }));
}

export async function markWhatsAppConversationRead(conversationId: string): Promise<void> {
  await prisma.whatsAppConversation.updateMany({
    where: { id: conversationId, unreadCount: { gt: 0 } },
    data: { unreadCount: 0, updatedAt: new Date() },
  });
}

export async function updateWhatsAppConversation(
  conversationId: string,
  patch: {
    status?: WhatsAppConversationStatus;
    assignedAgentId?: string | null;
    assignedAgentName?: string | null;
  }
): Promise<WhatsAppConversationRow | null> {
  const row = await prisma.whatsAppConversation.update({
    where: { id: conversationId },
    data: {
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.assignedAgentId !== undefined
        ? { assignedAgentId: patch.assignedAgentId }
        : {}),
      ...(patch.assignedAgentName !== undefined
        ? { assignedAgentName: patch.assignedAgentName }
        : {}),
      updatedAt: new Date(),
    },
    include: { contact: true },
  });

  return mapConversation(row);
}

export async function addWhatsAppConversationNote(input: {
  conversationId: string;
  authorId: string;
  authorName: string;
  body: string;
}) {
  return prisma.whatsAppConversationNote.create({
    data: {
      id: crypto.randomUUID(),
      conversationId: input.conversationId,
      authorId: input.authorId,
      authorName: input.authorName,
      body: input.body.trim(),
    },
  });
}

export async function getWhatsAppInboxSnapshot() {
  const [aggregate, conversations] = await Promise.all([
    prisma.whatsAppConversation.aggregate({ _sum: { unreadCount: true } }),
    listWhatsAppConversations({ status: "all", limit: 50 }),
  ]);

  return {
    totalUnread: aggregate._sum.unreadCount ?? 0,
    conversations,
  };
}

export async function findConversationByPhone(phone: string) {
  const waId = formatWhatsAppWaId(phone);
  if (!waId) return null;

  const contact = await prisma.whatsAppContact.findUnique({
    where: { waId },
    include: { conversations: true },
  });

  return contact?.conversations[0] ?? null;
}
