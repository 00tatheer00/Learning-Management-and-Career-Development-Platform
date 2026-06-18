export const PAYMENT_CONFIG = {
  registrationFee: 1000,
  currency: "PKR",
  learningMode: "Online",
  easypaisa: {
    number: "03275792600",
    accountName: "Syed Tatheer Hussain",
  },
  headline: "The Course Is Completely Free",
  registrationLabel: "One-Time Registration Fee",
  registrationNote: "PKR 1,000 only — to register and join the course",
  freeNote: "All course levels after registration are 100% free. No tuition. No hidden charges.",
  feeNote:
    "Pay PKR 1,000 once to register. The entire course ahead is fully free.",
  postRegistrationAccess: {
    title: "What you get after registration fee is paid",
    subtitle:
      "Students whose PKR 1,000 registration fee is verified will receive full course access, including:",
    items: [
      "Added to the official WhatsApp group",
      "Online live class link",
      "Recorded lecture videos",
      "Quizzes",
      "Assignments",
      "Projects",
    ],
  },
} as const;

export const ENROLLABLE_PROGRAM_SLUGS = [
  "web-development",
  "flutter-development",
] as const;
