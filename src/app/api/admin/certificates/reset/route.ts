import { NextResponse } from "next/server";
import { requireAdminApproveReject, isNextResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { resetCertificates } from "@/lib/certificates/certificate-service";
import { z } from "zod";

const resetSchema = z.object({
  programSlug: z.string().optional(),
  moduleName: z.string().optional(),
  resetAll: z.boolean().optional(),
});

export async function POST(request: Request) {
  const user = await requireAdminApproveReject();
  if (isNextResponse(user)) return user;

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = resetSchema.safeParse(body);
    const { programSlug, moduleName, resetAll } = parsed.success ? parsed.data : {};

    const deletedCount = await resetCertificates({
      programSlug: resetAll ? undefined : programSlug,
      moduleName: resetAll ? undefined : moduleName,
    });

    return NextResponse.json(
      createApiResponse(true, {
        deletedCount,
        message: `Successfully reset ${deletedCount} certificate(s).`,
      })
    );
  } catch (error) {
    console.error("Failed to reset certificates:", error);
    return NextResponse.json(
      createApiResponse(false, {
        error: "Reset failed",
        message: error instanceof Error ? error.message : "Failed to reset certificates",
      }),
      { status: 500 }
    );
  }
}
