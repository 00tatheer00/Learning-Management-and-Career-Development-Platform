import { NextResponse } from "next/server";
import { z } from "zod";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { createApiResponse } from "@/lib/api/enrollment";
import { saveEnrollment, getEnrollmentByEmail } from "@/lib/api/portal-data";
import { uploadPaymentScreenshot, uploadProfilePhoto } from "@/lib/cloudinary";
import { hashPassword } from "@/lib/auth/password";
import { encryptSecret } from "@/lib/crypto/secret";

const cnicRegex = /^\d{13}$/;
const whatsappRegex = /^03\d{9}$/;

const enrollmentBodySchema = z.object({
  fullName: z.string().min(2).max(100),
  fatherName: z.string().min(2).max(100),
  institution: z.string().min(2).max(150),
  classSemester: z.string().min(1).max(50),
  cnic: z.string().regex(cnicRegex),
  email: z.string().email(),
  portalPassword: z.string().min(8).max(72),
  whatsapp: z.string().regex(whatsappRegex),
  fieldOfStudy: z.string().min(2).max(100),
  program: z.enum(ENROLLABLE_PROGRAM_SLUGS),
  level: z.string().min(1),
  learningMode: z.literal("online"),
  hasLaptop: z.enum(["yes", "no"]),
  internetAvailable: z.enum(["yes", "no"]),
  confirmInfoCorrect: z.literal(true),
  agreeToPolicies: z.literal(true),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const screenshot = formData.get("paymentScreenshot");
    const profilePhoto = formData.get("profilePhoto");

    if (!(screenshot instanceof File) || screenshot.size === 0) {
      return NextResponse.json(
        createApiResponse(false, {
          error: "Validation failed",
          message: "Registration fee screenshot is required",
        }),
        { status: 400 }
      );
    }

    if (!(profilePhoto instanceof File) || profilePhoto.size === 0) {
      return NextResponse.json(
        createApiResponse(false, {
          error: "Validation failed",
          message: "Profile photo is required",
        }),
        { status: 400 }
      );
    }

    for (const [label, file] of [
      ["Screenshot", screenshot],
      ["Profile photo", profilePhoto],
    ] as const) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          createApiResponse(false, {
            error: "Validation failed",
            message: `${label} must be an image file`,
          }),
          { status: 400 }
        );
      }
    }

    if (screenshot.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        createApiResponse(false, {
          error: "Validation failed",
          message: "Screenshot must be smaller than 5MB",
        }),
        { status: 400 }
      );
    }

    if (profilePhoto.size > 3 * 1024 * 1024) {
      return NextResponse.json(
        createApiResponse(false, {
          error: "Validation failed",
          message: "Profile photo must be smaller than 3MB",
        }),
        { status: 400 }
      );
    }

    const raw = {
      fullName: String(formData.get("fullName") ?? ""),
      fatherName: String(formData.get("fatherName") ?? ""),
      institution: String(formData.get("institution") ?? ""),
      classSemester: String(formData.get("classSemester") ?? ""),
      cnic: String(formData.get("cnic") ?? "").replace(/[-\s]/g, ""),
      email: String(formData.get("email") ?? ""),
      portalPassword: String(formData.get("portalPassword") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? "").replace(/[\s-]/g, ""),
      fieldOfStudy: String(formData.get("fieldOfStudy") ?? ""),
      program: String(formData.get("program") ?? ""),
      level: String(formData.get("level") ?? ""),
      learningMode: String(formData.get("learningMode") ?? ""),
      hasLaptop: String(formData.get("hasLaptop") ?? ""),
      internetAvailable: String(formData.get("internetAvailable") ?? ""),
      confirmInfoCorrect: String(formData.get("confirmInfoCorrect") ?? "") === "true",
      agreeToPolicies: String(formData.get("agreeToPolicies") ?? "") === "true",
    };

    const validated = enrollmentBodySchema.safeParse(raw);

    if (!validated.success) {
      return NextResponse.json(
        createApiResponse(false, {
          error: "Validation failed",
          message: validated.error.issues[0]?.message,
        }),
        { status: 400 }
      );
    }

    const existingEnrollment = await getEnrollmentByEmail(validated.data.email);
    if (
      existingEnrollment &&
      (existingEnrollment.status === "pending" || existingEnrollment.status === "approved")
    ) {
      return NextResponse.json(
        createApiResponse(false, {
          error: "Already registered",
          message:
            existingEnrollment.status === "pending"
              ? "This email already has a pending registration. Please wait for admin approval."
              : "This email is already registered and approved. Use the portal login page.",
        }),
        { status: 409 }
      );
    }

    const id = crypto.randomUUID();
    const [paymentUpload, profileUpload] = await Promise.all([
      uploadPaymentScreenshot(screenshot, id),
      uploadProfilePhoto(profilePhoto, id),
    ]);

    const { portalPassword: _portalPassword, ...enrollmentData } = validated.data;
    const passwordHash = await hashPassword(validated.data.portalPassword);
    const portalPasswordEnc = encryptSecret(validated.data.portalPassword);

    await saveEnrollment({
      ...enrollmentData,
      id,
      paymentScreenshot: paymentUpload.url,
      paymentScreenshotPublicId: paymentUpload.publicId,
      profilePhotoUrl: profileUpload.url,
      profilePhotoPublicId: profileUpload.publicId,
      passwordHash,
      portalPasswordEnc,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      createApiResponse(true, {
        data: { id },
        message: "Registration submitted successfully",
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Internal server error" }),
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    createApiResponse(false, { error: "Method not allowed" }),
    { status: 405 }
  );
}
