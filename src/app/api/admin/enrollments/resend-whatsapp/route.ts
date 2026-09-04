import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin-access";
import { getEnrollmentById } from "@/lib/api/portal-data";
import { sendApprovalWhatsAppNotification } from "@/lib/notifications/ultramsg";
import { createApiResponse } from "@/lib/api/enrollment";

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  try {
    const body = await request.json();
    const { enrollmentId } = body;

    if (!enrollmentId || typeof enrollmentId !== "string") {
      return NextResponse.json(
        createApiResponse(false, { error: "Enrollment ID is required" }),
        { status: 400 }
      );
    }

    const enrollment = await getEnrollmentById(enrollmentId);
    if (!enrollment) {
      return NextResponse.json(
        createApiResponse(false, { error: "Enrollment not found" }),
        { status: 404 }
      );
    }

    if (enrollment.status !== "approved") {
      return NextResponse.json(
        createApiResponse(false, {
          error: "WhatsApp notification can only be sent for approved registrations",
        }),
        { status: 400 }
      );
    }

    if (!enrollment.whatsapp || !enrollment.whatsapp.trim()) {
      return NextResponse.json(
        createApiResponse(false, {
          error: "This student does not have a WhatsApp number on record",
        }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createApiResponse(false, {
        error: "Automated WhatsApp sending has been disabled. Please use the WhatsApp Template Pill to copy or send messages manually.",
      }),
      { status: 400 }
    );
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      createApiResponse(false, { error: errorMsg }),
      { status: 500 }
    );
  }
}
