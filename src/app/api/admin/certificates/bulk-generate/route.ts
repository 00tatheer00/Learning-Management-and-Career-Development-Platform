import { NextResponse } from "next/server";
import { requireAdminApproveReject, isNextResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { generateBulkCertificates } from "@/lib/certificates/certificate-service";
import { z } from "zod";

export const maxDuration = 60; // Max execution timeout for serverless environment

const bulkSchema = z.object({
  programSlug: z.string(),
  moduleName: z.string(),
  regenerateAll: z.boolean().optional(),
});

export async function POST(request: Request) {
  const user = await requireAdminApproveReject();
  if (isNextResponse(user)) return user;

  const body = await request.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  try {
    const summary = await generateBulkCertificates(
      parsed.data.programSlug,
      parsed.data.moduleName,
      { regenerateAll: parsed.data.regenerateAll }
    );

    return NextResponse.json(
      createApiResponse(true, {
        data: summary,
        message: `${summary.generatedCount} certificates generated successfully${summary.failedCount > 0 ? `, ${summary.failedCount} failed` : ""}.`,
      })
    );
  } catch (error) {
    console.error("Bulk certificate generation failed:", error);
    return NextResponse.json(
      createApiResponse(false, {
        error: "Bulk generation failed",
        message: "Failed to generate certificates",
      }),
      { status: 500 }
    );
  }
}
