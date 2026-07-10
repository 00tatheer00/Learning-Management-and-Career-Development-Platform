import { NextResponse } from "next/server";
import { z } from "zod";
import {
  requireAdminWrite,
  isNextResponse,
} from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import {
  getWhatsAppConversationDetail,
  getWhatsAppConversationMessagingWindow,
} from "@/lib/api/whatsapp-crm";
import { recordAgentReply } from "@/lib/whatsapp/crm/outbound";
import { sendCloudHelloWorldTestMessage, sendCloudTextMessage } from "@/lib/whatsapp/cloud-api/send";
import { prisma } from "@/lib/prisma";

const postSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    body: z.string().trim().min(1).max(4096),
  }),
  z.object({
    type: z.literal("template"),
    templateName: z.enum(["hello_world"]),
  }),
]);

const FREE_TEXT_BLOCKED =
  "Meta 24-hour rule: is number ne recently message nahi kiya. Pehle unse +92 321 5919502 par WhatsApp message karwao, ya 'Send template' button use karo.";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdminWrite(request);
  if (isNextResponse(user)) return user;

  const { id } = await params;
  const conversation = await getWhatsAppConversationDetail(id);
  if (!conversation) {
    return NextResponse.json(createApiResponse(false, { error: "Conversation not found" }), {
      status: 404,
    });
  }

  if (conversation.contact.isBlocked || conversation.status === "blocked") {
    return NextResponse.json(
      createApiResponse(false, { error: "This contact is blocked" }),
      { status: 400 }
    );
  }

  const body = await request.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  const window = await getWhatsAppConversationMessagingWindow(id);

  if (parsed.data.type === "text" && !window.canSendFreeText) {
    return NextResponse.json(createApiResponse(false, { error: FREE_TEXT_BLOCKED }), {
      status: 400,
    });
  }

  const sendResult =
    parsed.data.type === "template"
      ? await sendCloudHelloWorldTestMessage({ to: conversation.contact.waId })
      : await sendCloudTextMessage({
          to: conversation.contact.waId,
          body: parsed.data.body,
        });

  if (!sendResult.sent) {
    return NextResponse.json(
      createApiResponse(false, { error: sendResult.error ?? "Failed to send message" }),
      { status: 400 }
    );
  }

  const messageBody =
    parsed.data.type === "template"
      ? "[hello_world template] Hello! Welcome to EEST — reply here to start chatting."
      : parsed.data.body;

  const { messageId } = await recordAgentReply({
    conversationId: id,
    body: messageBody,
    wamid: sendResult.wamid,
    agentId: user.id,
    agentName: user.name,
  });

  if (conversation.status === "archived") {
    await prisma.whatsAppConversation.update({
      where: { id },
      data: { status: "open", updatedAt: new Date() },
    });
  }

  return NextResponse.json(
    createApiResponse(true, {
      data: {
        messageId,
        wamid: sendResult.wamid,
      },
    })
  );
}
