import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getAdminUser,
  requireAdminWrite,
  unauthorizedAdminResponse,
  isNextResponse,
} from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { getUltraMsgInstanceStatus } from "@/lib/notifications/whatsapp";

const WHATSAPP_DISABLED_MESSAGE =
  "WhatsApp automation is disabled. Only approve/reject registration messages are sent.";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return unauthorizedAdminResponse();

  const status = await getUltraMsgInstanceStatus();
  return NextResponse.json(createApiResponse(true, { data: status }));
}

const postSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("test"),
  }),
  z.object({
    action: z.literal("resendLogin"),
    studentId: z.string(),
  }),
]);

export async function POST(request: Request) {
  const user = await requireAdminWrite();
  if (isNextResponse(user)) return user;

  const body = await request.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  if (parsed.data.action === "test") {
    const status = await getUltraMsgInstanceStatus();
    return NextResponse.json(
      createApiResponse(false, {
        message: WHATSAPP_DISABLED_MESSAGE,
        data: { status },
      })
    );
  }

  return NextResponse.json(createApiResponse(false, { error: WHATSAPP_DISABLED_MESSAGE }), {
    status: 400,
  });
}
