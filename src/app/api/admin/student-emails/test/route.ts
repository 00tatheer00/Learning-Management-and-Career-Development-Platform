import { NextResponse } from "next/server";
import {
  requireAdminWrite,
  isNextResponse,
} from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { sendDemoStudentSampleEmails } from "@/lib/notifications/send-student-email-samples";
import { isStudentEmailDemoOnly } from "@/lib/notifications/student-email-audience";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await requireAdminWrite(request);
  if (isNextResponse(user)) return user;

  try {
    const result = await sendDemoStudentSampleEmails();

    return NextResponse.json(
      createApiResponse(true, {
        data: {
          ...result,
          demoOnly: isStudentEmailDemoOnly(),
        },
      })
    );
  } catch (error) {
    console.error("[admin/student-emails/test]", error);
    return NextResponse.json(
      createApiResponse(false, {
        error: error instanceof Error ? error.message : "Failed to send sample emails",
      }),
      { status: 500 }
    );
  }
}
