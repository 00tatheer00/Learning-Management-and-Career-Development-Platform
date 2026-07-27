export const PAYMENT_CONFIG = {
  registrationFee: 1000,
  currency: "PKR",
  learningMode: "Online",
  easypaisa: {
    number: "03115969527",
    accountName: "Fouzia Bibi",
  },
  headline: "Course is 100% FREE",
  registrationLabel: "One-Time Fee Per Module",
  registrationNote: "Pay registration fee per module — pay once per module",
  freeNote: "Registration fee per module. All classes & tasks in the module are included.",
  feeNote:
    "Pay registration fee per module. All lectures & tasks for the module are included.",
  postRegistrationAccess: {
    title: "What you get after payment verification",
    subtitle: "After we verify your payment, you will get:",
    items: [
      "Added to WhatsApp group",
      "Live online class link",
      "Recorded lecture videos",
      "Quizzes & assignments",
      "Projects to practice",
    ],
  },
} as const;

export const PROGRAM_FEES: Record<string, number> = {
  "web-development": 1000,
  "app-development": 1000,
  "artificial-intelligence": 1000,
};

export function getProgramRegistrationFee(programSlug?: string | null): number {
  if (!programSlug) return 1000;
  return PROGRAM_FEES[programSlug] ?? 1000;
}

export const ENROLLABLE_PROGRAM_SLUGS = [
  "web-development",
  "app-development",
  "artificial-intelligence",
] as const;

