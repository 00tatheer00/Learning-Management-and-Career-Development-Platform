import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getAdminUser,
  requireAdminWrite,
  unauthorizedAdminResponse,
  isNextResponse,
} from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import {
  listWhatsAppConversations,
  startWhatsAppConversationByPhone,
} from "@/lib/api/whatsapp-crm";
import { recordAgentReply } from "@/lib/whatsapp/crm/outbound";
import { sendCloudTextMessage } from "@/lib/whatsapp/cloud-api/send";

export async function GET(request: Request) {
  const user = await getAdminUser(request);
  if (!user) return unauthorizedAdminResponse();

  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") ?? "open") as "open" | "archived" | "blocked" | "all";
  const search = searchParams.get("search") ?? undefined;

  const conversations = await listWhatsAppConversations({ status, search });
  return NextResponse.json(createApiResponse(true, { data: conversations }));
}

const postSchema = z.object({
  phone: z.string().trim().min(10).max(20),
  body: z.string().trim().min(1).max(4096),
  name: z.string().trim().max(120).optional(),
});

/** Start (or open) a conversation and send the first message to any number. */
export async function POST(request: Request) {
  const user = await requireAdminWrite(request);
  if (isNextResponse(user)) return user;

  const body = await request.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  const conversation = await startWhatsAppConversationByPhone({
    phone: parsed.data.phone,
    displayName: parsed.data.name,
  });

  if (!conversation) {
    return NextResponse.json(
      createApiResponse(false, {
        error: `Invalid WhatsApp number "${parsed.data.phone}". Use 03XXXXXXXXX format.`,
      }),
      { status: 400 }
    );
  }

  if (conversation.contact.isBlocked || conversation.status === "blocked") {
    return NextResponse.json(createApiResponse(false, { error: "This contact is blocked" }), {
      status: 400,
    });
  }

  const sendResult = await sendCloudTextMessage({
    to: conversation.contact.waId,
    body: parsed.data.body,
  });

  if (!sendResult.sent) {
    return NextResponse.json(
      createApiResponse(false, {
        error:
          sendResult.error ??
          "Failed to send. If they have not messaged you in 24 hours, ask them to message your business number first or use an approved template.",
        data: { conversation },
      }),
      { status: 400 }
    );
  }

  const { messageId } = await recordAgentReply({
    conversationId: conversation.id,
    body: parsed.data.body,
    wamid: sendResult.wamid,
    agentId: user.id,
    agentName: user.name,
  });

  return NextResponse.json(
    createApiResponse(true, {
      data: {
        conversation,
        messageId,
        wamid: sendResult.wamid,
      },
    })
  );
}
