export const PAYMENT_CONFIG = {
  registrationFee: 1000,
  currency: "PKR",
  learningMode: "Online",
  easypaisa: {
    number: "03115969527",
    accountName: "Fouzia Bibi",
  },
  headline: "Course is 100% FREE",
  registrationLabel: "One-Time Fee",
  registrationNote: "Only Rs 1,000 to join — pay once, learn free",
  freeNote: "After Rs 1,000 registration, all classes and levels are free. No extra charges.",
  feeNote:
    "Pay PKR 1,000 once to register. The entire course ahead is fully free.",
  postRegistrationAccess: {
    title: "What you get after you pay Rs 1,000",
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
