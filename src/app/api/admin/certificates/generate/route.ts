import { NextResponse } from "next/server";
import { requireAdminApproveReject, isNextResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { generateSingleCertificate } from "@/lib/certificates/certificate-service";
import { z } from "zod";

const generateSchema = z.object({
  studentId: z.string(),
  programSlug: z.string(),
  moduleName: z.string(),
});

export async function POST(request: Request) {
  const user = await requireAdminApproveReject();
  if (isNextResponse(user)) return user;

  const body = await request.json();
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  try {
    const certificate = await generateSingleCertificate({
      studentId: parsed.data.studentId,
      programSlug: parsed.data.programSlug,
      moduleName: parsed.data.moduleName,
    });

    return NextResponse.json(
      createApiResponse(true, {
        data: certificate,
        message: `Certificate ${certificate.verificationCode} generated successfully.`,
      })
    );
  } catch (error) {
    console.error("Single certificate generation failed:", error);
    return NextResponse.json(
      createApiResponse(false, {
        error: "Generation failed",
        message: error instanceof Error ? error.message : "Failed to generate certificate",
      }),
      { status: 500 }
    );
  }
}
