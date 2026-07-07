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
  getAdminCredentialRows,
  updateStudentLoginDetails,
} from "@/lib/api/admin-credentials";
import { generateMissingPortalPasswords } from "@/lib/api/admin-credentials-bulk";
import { revealEnrollmentPortalPassword, revealStudentPortalPassword } from "@/lib/api/admin-portal-password";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return unauthorizedAdminResponse();

  const rows = await getAdminCredentialRows();
  const missingCount = rows.filter((row) => !row.hasStoredPassword).length;
  const neverLoggedInCount = rows.filter((row) => !row.hasLoggedIn).length;

  return NextResponse.json(
    createApiResponse(true, {
      data: {
        rows,
        meta: {
          total: rows.length,
          saved: rows.length - missingCount,
          missing: missingCount,
          loggedIn: rows.length - neverLoggedInCount,
          neverLoggedIn: neverLoggedInCount,
        },
      },
    })
  );
}

const patchSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export async function PATCH(request: Request) {
  const user = await requireAdminWrite();
  if (isNextResponse(user)) return user;

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  if (!parsed.data.email && parsed.data.phone === undefined) {
    return NextResponse.json(
      createApiResponse(false, { message: "Provide login ID or phone to update." }),
      { status: 400 }
    );
  }

  const result = await updateStudentLoginDetails(parsed.data.id, {
    email: parsed.data.email,
    phone: parsed.data.phone,
  });

  if (!result.success) {
    return NextResponse.json(createApiResponse(false, { error: result.error }), {
      status: result.error === "Student not found" ? 404 : 409,
    });
  }

  return NextResponse.json(
    createApiResponse(true, {
      message: result.message,
      data: { email: result.email, phone: result.phone },
    })
  );
}

const postSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("generateMissing"),
  }),
  z.object({
    action: z.literal("revealPassword"),
    enrollmentId: z.string().optional(),
    studentId: z.string().optional(),
  }),
  z.object({
    action: z.literal("bulkResendLogin"),
    studentIds: z.array(z.string()).optional(),
    neverLoggedInOnly: z.boolean().optional(),
  }),
]);

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return unauthorizedAdminResponse();

  const body = await request.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(createApiResponse(false, { message: "Invalid action" }), {
      status: 400,
    });
  }

  if (parsed.data.action === "revealPassword") {
    if (!parsed.data.enrollmentId && !parsed.data.studentId) {
      return NextResponse.json(createApiResponse(false, { message: "Provide enrollmentId or studentId." }), {
        status: 400,
      });
    }

    const result = parsed.data.enrollmentId
      ? await revealEnrollmentPortalPassword(parsed.data.enrollmentId)
      : await revealStudentPortalPassword(parsed.data.studentId!);
    if (!result.password) {
      return NextResponse.json(createApiResponse(false, { error: result.error ?? "Password not available" }), {
        status: result.error === "Student not found" ? 404 : 400,
      });
    }

    return NextResponse.json(
      createApiResponse(true, {
        data: { password: result.password },
      })
    );
  }

  const writeUser = await requireAdminWrite();
  if (isNextResponse(writeUser)) return writeUser;

  if (parsed.data.action === "bulkResendLogin") {
    return NextResponse.json(
      createApiResponse(false, {
        error: "Bulk WhatsApp is disabled. Approve students one by one or share login manually.",
      }),
      { status: 403 }
    );
  }

  const result = await generateMissingPortalPasswords();
  const message =
    result.generated > 0
      ? `Generated and saved ${result.generated} missing password(s).`
      : "No missing passwords to generate.";

  return NextResponse.json(
    createApiResponse(true, {
      data: result,
      message:
        result.errors.length > 0 ? `${message} ${result.errors.length} error(s).` : message,
    })
  );
}
