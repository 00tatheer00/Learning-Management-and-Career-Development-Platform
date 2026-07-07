import { NextResponse } from "next/server";
import { requireAdminRead, isNextResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { getSignedCloudinaryUrl } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const admin = await requireAdminRead();
  if (isNextResponse(admin)) return admin;

  const enrollmentId = new URL(request.url).searchParams.get("enrollmentId")?.trim();
  if (!enrollmentId) {
    return NextResponse.json(
      createApiResponse(false, { error: "enrollmentId is required" }),
      { status: 400 }
    );
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      paymentScreenshot: true,
      paymentScreenshotPublicId: true,
    },
  });

  if (!enrollment) {
    return NextResponse.json(createApiResponse(false, { error: "Enrollment not found" }), {
      status: 404,
    });
  }

  if (enrollment.paymentScreenshotPublicId) {
    try {
      const signedUrl = getSignedCloudinaryUrl(enrollment.paymentScreenshotPublicId);
      return NextResponse.redirect(signedUrl);
    } catch (error) {
      console.error("Signed payment screenshot URL failed:", error);
      return NextResponse.json(
        createApiResponse(false, { error: "Could not open payment screenshot" }),
        { status: 500 }
      );
    }
  }

  if (enrollment.paymentScreenshot?.startsWith("http")) {
    return NextResponse.redirect(enrollment.paymentScreenshot);
  }

  return NextResponse.json(createApiResponse(false, { error: "No payment screenshot" }), {
    status: 404,
  });
}
