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
  registrationNote: "Only Rs 1,000 per module registration — pay once per module",
  freeNote: "Only Rs 1,000 registration fee per module. All classes & tasks in the module are free.",
  feeNote:
    "Pay PKR 1,000 registration fee per module. All lectures & tasks for the module are included.",
  postRegistrationAccess: {
    title: "What you get after you pay Rs 1,000 per module",
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

export const ENROLLABLE_PROGRAM_SLUGS = [
  "web-development",
  "app-development",
] as const;
