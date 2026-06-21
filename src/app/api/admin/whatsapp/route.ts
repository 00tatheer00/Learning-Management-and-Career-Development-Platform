import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { getUltraMsgInstanceStatus, sendWhatsAppMessage } from "@/lib/notifications/whatsapp";
import { resendStudentLoginWhatsApp } from "@/lib/notifications/student-login-whatsapp";

const DEFAULT_ADMIN_ALERT_WHATSAPP = "03115969527";

function getAdminAlertWhatsApp() {
  return process.env.ADMIN_ALERT_WHATSAPP?.trim() || DEFAULT_ADMIN_ALERT_WHATSAPP;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

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
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

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
    const adminPhone = getAdminAlertWhatsApp();
    const result = await sendWhatsAppMessage(
      adminPhone,
      "✅ EEST Portal WhatsApp test\n\nIf you received this, UltraMsg is working from the live server."
    );

    return NextResponse.json(
      createApiResponse(result.sent, {
        message: result.sent
          ? `Test message sent to ${adminPhone}.`
          : result.error ?? "Test message failed",
        data: { status, adminPhone },
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
