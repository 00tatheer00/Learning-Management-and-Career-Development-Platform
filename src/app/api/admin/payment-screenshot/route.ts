import { NextResponse } from "next/server";
import { requireAdminRead, isNextResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import {
  fetchFirstAvailableImage,
  resolvePaymentScreenshotCandidates,
} from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const admin = await requireAdminRead();
  if (isNextResponse(admin)) return admin;

  const { searchParams } = new URL(request.url);
  const enrollmentId = searchParams.get("enrollmentId")?.trim();
  const mode = searchParams.get("mode")?.trim();

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

  const candidates = resolvePaymentScreenshotCandidates(enrollment);

  if (candidates.length === 0) {
    return NextResponse.json(createApiResponse(false, { error: "No payment screenshot" }), {
      status: 404,
    });
  }

  if (mode === "redirect") {
    return NextResponse.redirect(candidates[0]!);
  }

  try {
    const image = await fetchFirstAvailableImage(candidates);
    if (!image) {
      return NextResponse.json(
        createApiResponse(false, { error: "Could not load payment screenshot from Cloudinary" }),
        { status: 404 }
      );
    }

    return new NextResponse(new Uint8Array(image.buffer), {
      status: 200,
      headers: {
        "Content-Type": image.contentType,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    console.error("Payment screenshot proxy failed:", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Could not open payment screenshot" }),
      { status: 500 }
    );
  }
}
