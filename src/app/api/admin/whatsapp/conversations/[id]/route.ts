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
  getWhatsAppConversationDetail,
  getWhatsAppConversationMessages,
  markWhatsAppConversationRead,
  updateWhatsAppConversation,
} from "@/lib/api/whatsapp-crm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUser(request);
  if (!user) return unauthorizedAdminResponse();

  const { id } = await params;
  const conversation = await getWhatsAppConversationDetail(id);
  if (!conversation) {
    return NextResponse.json(createApiResponse(false, { error: "Conversation not found" }), {
      status: 404,
    });
  }

  const { searchParams } = new URL(request.url);
  const before = searchParams.get("before") ?? undefined;
  const messages = await getWhatsAppConversationMessages(id, { before });

  await markWhatsAppConversationRead(id);

  return NextResponse.json(
    createApiResponse(true, {
      data: { conversation: { ...conversation, unreadCount: 0 }, messages },
    })
  );
}

const patchSchema = z.object({
  status: z.enum(["open", "archived", "blocked"]).optional(),
  assignedAgentId: z.string().nullable().optional(),
  assignedAgentName: z.string().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdminWrite(request);
  if (isNextResponse(user)) return user;

  const { id } = await params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  const conversation = await updateWhatsAppConversation(id, parsed.data);
  if (!conversation) {
    return NextResponse.json(createApiResponse(false, { error: "Conversation not found" }), {
      status: 404,
    });
  }

  return NextResponse.json(createApiResponse(true, { data: conversation }));
}
