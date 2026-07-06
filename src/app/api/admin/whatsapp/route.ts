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
import { resendStudentLoginWhatsApp } from "@/lib/notifications/student-login-whatsapp";

const WHATSAPP_TEST_DISABLED_MESSAGE =
  "Test messages are disabled. Use Resend Login or approve a student to verify WhatsApp.";

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
        message: WHATSAPP_TEST_DISABLED_MESSAGE,
        data: { status },
      })
    );
  }

  const result = await resendStudentLoginWhatsApp(parsed.data.studentId);
  if (!result.success) {
    return NextResponse.json(createApiResponse(false, { error: result.error ?? "Send failed" }), {
      status: 400,
    });
  }

  return NextResponse.json(createApiResponse(true, { message: result.message }));
}
