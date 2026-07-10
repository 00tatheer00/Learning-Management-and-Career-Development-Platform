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
  getWhatsAppConversationMessagingWindow,
} from "@/lib/api/whatsapp-crm";
import { recordAgentReply } from "@/lib/whatsapp/crm/outbound";
import { sendCloudHelloWorldTestMessage, sendCloudTextMessage } from "@/lib/whatsapp/cloud-api/send";

const FREE_TEXT_BLOCKED =
  "Meta 24-hour rule: pehle customer ko business number par message karwana hoga, ya template bhejo.";

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
  body: z.string().trim().min(1).max(4096).optional(),
  name: z.string().trim().max(120).optional(),
  sendTemplate: z.boolean().optional(),
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

  if (!parsed.data.sendTemplate && !parsed.data.body?.trim()) {
    return NextResponse.json(
      createApiResponse(false, { message: "Provide a message or use sendTemplate." }),
      { status: 400 }
    );
  }

  const messagingWindow = await getWhatsAppConversationMessagingWindow(conversation.id);
  const useTemplate = parsed.data.sendTemplate === true;

  if (!useTemplate && !messagingWindow.canSendFreeText) {
    return NextResponse.json(createApiResponse(false, { error: FREE_TEXT_BLOCKED }), {
      status: 400,
    });
  }

  const sendResult = useTemplate
    ? await sendCloudHelloWorldTestMessage({ to: conversation.contact.waId })
    : await sendCloudTextMessage({
        to: conversation.contact.waId,
        body: parsed.data.body!.trim(),
      });

  if (!sendResult.sent) {
    return NextResponse.json(
      createApiResponse(false, {
        error: sendResult.error ?? "Failed to send message",
        data: { conversation },
      }),
      { status: 400 }
    );
  }

  const messageBody = useTemplate
    ? "[hello_world template] Hello! Welcome to EEST — reply here to start chatting."
    : parsed.data.body!.trim();

  const { messageId } = await recordAgentReply({
    conversationId: conversation.id,
    body: messageBody,
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
