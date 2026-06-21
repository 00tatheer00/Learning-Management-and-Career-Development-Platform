import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import {
  approveEnrollmentAndCreateAccount,
  rejectEnrollment,
  deleteEnrollmentRegistration,
} from "@/lib/api/admin-enrollment-actions";
import { getAdminEnrollmentRows } from "@/lib/api/admin-enrollments";
import { z } from "zod";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const enrollments = await getAdminEnrollmentRows();
  return NextResponse.json(createApiResponse(true, { data: enrollments }));
}

const patchSchema = z.object({
  id: z.string(),
  status: z.enum(["approved", "rejected"]),
  adminNotes: z.string().optional(),
  createStudentAccount: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  if (parsed.data.status === "rejected" && !parsed.data.adminNotes?.trim()) {
    return NextResponse.json(
      createApiResponse(false, { message: "Rejection reason is required" }),
      { status: 400 }
    );
  }

  const result =
    parsed.data.status === "approved"
      ? await approveEnrollmentAndCreateAccount(
          parsed.data.id,
          user.id,
          parsed.data.adminNotes
        )
      : await rejectEnrollment(parsed.data.id, user.id, parsed.data.adminNotes);

  if (!result.enrollment) {
    return NextResponse.json(createApiResponse(false, { error: result.error ?? "Not found" }), {
      status: result.error === "Enrollment not found" ? 404 : 400,
    });
  }

  const credentials =
    parsed.data.status === "approved" && "credentials" in result
      ? result.credentials
      : undefined;

  return NextResponse.json({
    ...createApiResponse(true, {
      data: result.enrollment,
      message: result.message,
    }),
    ...(credentials ? { credentials } : {}),
  });
}

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1).max(50),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const body = await request.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  const results: { id: string; success: boolean; message?: string; error?: string }[] = [];

  for (const id of parsed.data.ids) {
    const result = await approveEnrollmentAndCreateAccount(id, user.id);
    results.push({
      id,
      success: Boolean(result.enrollment),
      message: result.message,
      error: result.error,
    });
  }

  const approved = results.filter((item) => item.success).length;
  const failed = results.length - approved;

  return NextResponse.json(
    createApiResponse(true, {
      data: results,
      message: `${approved} approved${failed > 0 ? `, ${failed} failed` : ""}.`,
    })
  );
}

const deleteSchema = z.object({
  id: z.string(),
});

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const body = await request.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  const result = await deleteEnrollmentRegistration(parsed.data.id);
  if (!result.success) {
    return NextResponse.json(createApiResponse(false, { error: result.error ?? "Delete failed" }), {
      status: result.error === "Enrollment not found" ? 404 : 400,
    });
  }

  return NextResponse.json(createApiResponse(true, { message: result.message }));
}
