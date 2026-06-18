import { z } from "zod";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";

const cnicRegex = /^\d{13}$/;
const whatsappRegex = /^03\d{9}$/;

export const enrollmentSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),
  fatherName: z
    .string()
    .min(2, "Father name is required")
    .max(100, "Father name is too long"),
  institution: z
    .string()
    .min(2, "School / college / university is required")
    .max(150, "Institution name is too long"),
  classSemester: z
    .string()
    .min(1, "Class or semester is required")
    .max(50, "Class or semester is too long"),
  cnic: z
    .string()
    .transform((val) => val.replace(/[-\s]/g, ""))
    .pipe(z.string().regex(cnicRegex, "CNIC must be exactly 13 digits (no dashes)")),
  email: z.string().email("Please enter a valid email address"),
  whatsapp: z
    .string()
    .transform((val) => val.replace(/[\s-]/g, ""))
    .pipe(
      z
        .string()
        .regex(whatsappRegex, "Enter a valid WhatsApp number (e.g. 03001234567)")
    ),
  fieldOfStudy: z
    .string()
    .min(2, "Field of study is required")
    .max(100, "Field of study is too long"),
  program: z.enum(ENROLLABLE_PROGRAM_SLUGS, {
    message: "Please select a program",
  }),
  level: z.string().min(1, "Please select a starting level"),
  learningMode: z.literal("online"),
  hasLaptop: z.enum(["yes", "no"], {
    message: "Please indicate if you have a laptop",
  }),
  internetAvailable: z.enum(["yes", "no"], {
    message: "Please indicate internet availability",
  }),
  confirmInfoCorrect: z.boolean().refine((v) => v === true, {
    message: "You must confirm that all information provided is correct",
  }),
  agreeToPolicies: z.boolean().refine((v) => v === true, {
    message: "You must agree to the rules, attendance policy, and code of conduct",
  }),
});

export type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

export function validatePaymentScreenshot(file: File | undefined): string | null {
  if (!file || file.size === 0) {
    return "Registration fee screenshot is required";
  }
  if (!file.type.startsWith("image/")) {
    return "Screenshot must be an image (JPG, PNG, etc.)";
  }
  if (file.size > 5 * 1024 * 1024) {
    return "Screenshot must be smaller than 5MB";
  }
  return null;
}
