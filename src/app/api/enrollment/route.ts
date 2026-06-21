import { NextResponse } from "next/server";
import { z } from "zod";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { getBatchForProgram } from "@/lib/constants/batch";
import { createApiResponse } from "@/lib/api/enrollment";
import { saveEnrollment } from "@/lib/api/portal-data";
import { sendAdminNewRegistrationAlert } from "@/lib/notifications/admin-registration-alert";
import { uploadPaymentScreenshot } from "@/lib/cloudinary";
import {
  isPaymentScreenshotImage,
  MAX_PAYMENT_SCREENSHOT_BYTES,
  normalizeCnic,
  normalizeWhatsappNumber,
} from "@/lib/utils/payment-screenshot";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const cnicRegex = /^\d{13}$/;
const whatsappRegex = /^03\d{9}$/;

const enrollmentBodySchema = z.object({
  fullName: z.string().min(2).max(100),
  fatherName: z.string().min(2).max(100),
  institution: z.string().min(2).max(150),
  classSemester: z.string().min(1).max(50),
  cnic: z.string().regex(cnicRegex),
  email: z.string().email(),
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

function friendlyValidationMessage(issue: z.ZodIssue | undefined): string {
  if (!issue) return "Please check all required fields and try again.";
  const field = String(issue.path[0] ?? "");
  if (field === "cnic") return "CNIC must be exactly 13 digits (numbers only).";
  if (field === "whatsapp") {
    return "WhatsApp number must start with 03 and be 11 digits (e.g. 03001234567).";
  }
  if (field === "program") return "Please select Web Development or App Development.";
  if (field === "level") return "Please choose your starting module.";
  if (field === "confirmInfoCorrect") return "Please confirm your details are correct.";
  if (field === "agreeToPolicies") return "Please agree to the class rules.";
  return issue.message || "Please check all required fields and try again.";
}

export async function POST(request: Request) {
  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        createApiResponse(false, {
          error: "Invalid form data",
          message: "Could not read the registration form. Please refresh the page and try again.",
        }),
        { status: 400 }
      );
    }

    const screenshot = formData.get("paymentScreenshot");

    if (!(screenshot instanceof File) || screenshot.size === 0) {
      return NextResponse.json(
        createApiResponse(false, {
          error: "Validation failed",
          message: "Payment screenshot is required. Please upload your Easypaisa payment proof.",
        }),
        { status: 400 }
      );
    }

    if (!isPaymentScreenshotImage(screenshot)) {
      return NextResponse.json(
        createApiResponse(false, {
          error: "Validation failed",
          message:
            "Screenshot must be an image (JPG or PNG). On iPhone, save as JPG or take a new screenshot.",
        }),
        { status: 400 }
      );
    }

    if (screenshot.size > MAX_PAYMENT_SCREENSHOT_BYTES) {
      return NextResponse.json(
        createApiResponse(false, {
          error: "Validation failed",
          message: "Screenshot is too large. Please upload an image under 4MB.",
        }),
        { status: 400 }
      );
    }

    const raw = {
      fullName: String(formData.get("fullName") ?? "").trim(),
      fatherName: String(formData.get("fatherName") ?? "").trim(),
      institution: String(formData.get("institution") ?? "").trim(),
      classSemester: String(formData.get("classSemester") ?? "").trim(),
      cnic: normalizeCnic(String(formData.get("cnic") ?? "")),
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      whatsapp: normalizeWhatsappNumber(String(formData.get("whatsapp") ?? "")),
      fieldOfStudy: String(formData.get("fieldOfStudy") ?? "").trim(),
      program: String(formData.get("program") ?? "").trim(),
      level: String(formData.get("level") ?? "").trim(),
      learningMode: String(formData.get("learningMode") ?? "").trim(),
      hasLaptop: String(formData.get("hasLaptop") ?? "").trim(),
      internetAvailable: String(formData.get("internetAvailable") ?? "").trim(),
      confirmInfoCorrect: String(formData.get("confirmInfoCorrect") ?? "") === "true",
      agreeToPolicies: String(formData.get("agreeToPolicies") ?? "") === "true",
    };

    const validated = enrollmentBodySchema.safeParse(raw);

    if (!validated.success) {
      return NextResponse.json(
        createApiResponse(false, {
          error: "Validation failed",
          message: friendlyValidationMessage(validated.error.issues[0]),
        }),
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    let paymentUpload: { url: string; publicId: string };
    try {
      paymentUpload = await uploadPaymentScreenshot(screenshot, id);
    } catch (uploadError) {
      console.error("Payment screenshot upload failed:", uploadError);
      return NextResponse.json(
        createApiResponse(false, {
          error: "Upload failed",
          message:
            "Could not upload payment screenshot. Please try a smaller JPG/PNG image under 4MB, or try again in a minute.",
        }),
        { status: 503 }
      );
    }

    const createdAt = new Date().toISOString();
    const batch = getBatchForProgram(validated.data.program);

    await saveEnrollment({
      ...validated.data,
      batch,
      id,
      paymentScreenshot: paymentUpload.url,
      paymentScreenshotPublicId: paymentUpload.publicId,
      createdAt,
    });

    void sendAdminNewRegistrationAlert({
      fullName: validated.data.fullName,
      email: validated.data.email,
      whatsapp: validated.data.whatsapp,
      program: validated.data.program,
      level: validated.data.level,
      batch,
      institution: validated.data.institution,
      createdAt,
      enrollmentId: id,
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
      createApiResponse(false, {
        error: "Internal server error",
        message:
          "Something went wrong on our server. Please try again in a minute. If it keeps failing, WhatsApp us your details.",
      }),
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
