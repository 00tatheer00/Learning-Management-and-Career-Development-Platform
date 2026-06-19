import { z } from "zod";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";

const cnicRegex = /^\d{13}$/;
const whatsappRegex = /^03\d{9}$/;

export const enrollmentSchema = z.object({
  fullName: z
    .string()
    .min(2, "Please write your full name")
    .max(100, "Name is too long"),
  fatherName: z
    .string()
    .min(2, "Please write father's name")
    .max(100, "Name is too long"),
  institution: z
    .string()
    .min(2, "Please write your school/college name")
    .max(150, "Name is too long"),
  classSemester: z
    .string()
    .min(1, "Please write your class or semester")
    .max(50, "Too long"),
  cnic: z
    .string()
    .transform((val) => val.replace(/[-\s]/g, ""))
    .pipe(z.string().regex(cnicRegex, "CNIC must be 13 numbers only (no dashes)")),
  email: z.string().email("Please enter a valid email"),
  whatsapp: z
    .string()
    .transform((val) => val.replace(/[\s-]/g, ""))
    .pipe(
      z
        .string()
        .regex(whatsappRegex, "WhatsApp must start with 03 and be 11 digits (e.g. 03001234567)")
    ),
  fieldOfStudy: z
    .string()
    .min(2, "Please write what you study")
    .max(100, "Too long"),
  program: z.enum(ENROLLABLE_PROGRAM_SLUGS, {
    message: "Please choose Web or App course",
  }),
  level: z.string().min(1, "Please choose a level"),
  learningMode: z.literal("online"),
  hasLaptop: z.enum(["yes", "no"], {
    message: "Please answer: do you have a laptop?",
  }),
  internetAvailable: z.enum(["yes", "no"], {
    message: "Please answer: do you have internet?",
  }),
  confirmInfoCorrect: z.boolean().refine((v) => v === true, {
    message: "Please tick the box to confirm your details are correct",
  }),
  agreeToPolicies: z.boolean().refine((v) => v === true, {
    message: "Please tick the box to agree to class rules",
  }),
});

export type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

export function validatePaymentScreenshot(file: File | undefined): string | null {
  if (!file || file.size === 0) {
    return "Please upload your Easypaisa payment screenshot";
  }
  if (!file.type.startsWith("image/")) {
    return "Screenshot must be an image (JPG, PNG, etc.)";
  }
  if (file.size > 5 * 1024 * 1024) {
    return "Screenshot must be smaller than 5MB";
  }
  return null;
}
