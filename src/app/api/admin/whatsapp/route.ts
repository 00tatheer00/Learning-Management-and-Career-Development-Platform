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
  getWhatsAppConnectionStatus,
  sendWhatsAppMessage,
} from "@/lib/notifications/whatsapp";
import {
  resendEnrollmentLoginWhatsApp,
  resendStudentLoginWhatsApp,
} from "@/lib/notifications/student-login-whatsapp";

export async function GET(request: Request) {
  const user = await getAdminUser(request);
  if (!user) return unauthorizedAdminResponse();

  const status = await getWhatsAppConnectionStatus();
  return NextResponse.json(createApiResponse(true, { data: status }));
}

const postSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("test"),
    phone: z.string().optional(),
    message: z.string().optional(),
  }),
  z.object({
    action: z.literal("resendLogin"),
    enrollmentId: z.string().optional(),
    studentId: z.string().optional(),
  }),
]);

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

  if (parsed.data.action === "test") {
    const status = await getWhatsAppConnectionStatus();
    if (!status.connected) {
      return NextResponse.json(
        createApiResponse(false, {
          message: status.error ?? "WhatsApp is not connected",
          data: { status },
        }),
        { status: 400 }
      );
    }

    const phone = parsed.data.phone?.trim() || user.phone?.trim();
    if (!phone) {
      return NextResponse.json(
        createApiResponse(false, {
          message: "Provide a test phone number or add phone to your admin account.",
          data: { status },
        }),
        { status: 400 }
      );
    }

    const result = await sendWhatsAppMessage(
      phone,
      parsed.data.message?.trim() ||
        "EEST portal test — WhatsApp Cloud API is connected and working.",
      "test"
    );

    if (!result.sent) {
      return NextResponse.json(
        createApiResponse(false, {
          message: result.error ?? "Test message failed",
          data: { status },
        }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createApiResponse(true, {
        message: "Test message sent",
        data: { status },
      })
    );
  }

  if (!parsed.data.enrollmentId && !parsed.data.studentId) {
    return NextResponse.json(
      createApiResponse(false, { message: "Provide enrollmentId or studentId." }),
      { status: 400 }
    );
  }

  const result = parsed.data.enrollmentId
    ? await resendEnrollmentLoginWhatsApp(parsed.data.enrollmentId)
    : await resendStudentLoginWhatsApp(parsed.data.studentId!);

  if (!result.success) {
    return NextResponse.json(createApiResponse(false, { error: result.error ?? "Send failed" }), {
      status: 400,
    });
  }

  return NextResponse.json(createApiResponse(true, { message: result.message }));
}
