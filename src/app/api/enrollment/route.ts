import { NextResponse } from "next/server";
import { z } from "zod";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import {
  savePaymentScreenshot,
  createApiResponse,
} from "@/lib/api/enrollment";
import { saveEnrollment } from "@/lib/api/portal-data";

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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const screenshot = formData.get("paymentScreenshot");

    if (!(screenshot instanceof File) || screenshot.size === 0) {
      return NextResponse.json(
        createApiResponse(false, {
          error: "Validation failed",
          message: "Registration fee screenshot is required",
        }),
        { status: 400 }
      );
    }

    if (!screenshot.type.startsWith("image/")) {
      return NextResponse.json(
        createApiResponse(false, {
          error: "Validation failed",
          message: "Screenshot must be an image file",
        }),
        { status: 400 }
      );
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

    const raw = {
      fullName: String(formData.get("fullName") ?? ""),
      fatherName: String(formData.get("fatherName") ?? ""),
      institution: String(formData.get("institution") ?? ""),
      classSemester: String(formData.get("classSemester") ?? ""),
      cnic: String(formData.get("cnic") ?? "").replace(/[-\s]/g, ""),
      email: String(formData.get("email") ?? ""),
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

    const id = crypto.randomUUID();
    const screenshotPath = await savePaymentScreenshot(id, screenshot);

    const enrollment = {
      ...validated.data,
      id,
      paymentScreenshot: screenshotPath,
      createdAt: new Date().toISOString(),
    };

    await saveEnrollment(enrollment);

    return NextResponse.json(
      createApiResponse(true, {
        data: { id: enrollment.id },
        message: "Registration submitted successfully",
      }),
      { status: 201 }
    );
  } catch {
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
