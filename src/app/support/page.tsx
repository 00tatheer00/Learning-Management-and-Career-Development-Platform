import type { Metadata } from "next";
import { PublicSupportContent } from "@/components/sections/public-support-content";
import { BreadcrumbSchema, FAQSchema, SupportServiceSchema } from "@/components/seo/json-ld";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = createMetadata({
  title: "Student Support & Helpdesk Center | EEST Training",
  description:
    "Need assistance? Submit a support ticket, upload screenshots, and track status anytime with our 48-hour response guarantee. No login required.",
  path: "/support",
  keywords: [
    "EEST Support Helpdesk",
    "Student Support Center",
    "Course Assistance",
    "Portal Login Help",
    "Payment Verification Support",
    "Submit Support Ticket",
    "Track Support Ticket",
  ],
});

const SUPPORT_FAQS = [
  {
    question: "Do I need a student account to submit a support ticket?",
    answer: "No, guests and prospective students can submit a ticket using just their name and email address.",
  },
  {
    question: "How long does it take for the support team to respond?",
    answer: "Our support and admissions team responds to all submitted tickets within 48 business hours.",
  },
  {
    question: "How can I track the status of my submitted ticket?",
    answer: "You can track your tickets anytime on this page by entering the email address you used during submission.",
  },
  {
    question: "Can I attach screenshots or transaction receipts to my ticket?",
    answer: "Yes, you can upload image screenshots (PNG, JPG, WEBP up to 5MB) directly while submitting your ticket.",
  },
];

export default function PublicSupportPage() {
  return (
    <>
      <SupportServiceSchema />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Support & Helpdesk", url: `${SITE_CONFIG.url}/support` },
        ]}
      />
      <FAQSchema faqs={SUPPORT_FAQS} />
      <PublicSupportContent />
    </>
  );
}
