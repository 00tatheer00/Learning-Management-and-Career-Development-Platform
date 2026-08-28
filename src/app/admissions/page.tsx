import { PageHero } from "@/components/shared/page-hero";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/json-ld";
import { AdmissionsSection } from "@/components/sections/admissions";
import { FAQSection } from "@/components/sections/faq";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import { faqs } from "@/lib/data/faqs";

export const metadata = createMetadata({
  title: "Admissions & Eligibility Criteria",
  description:
    "Learn about our registration-based modular learning model, eligibility requirements, batch dates, fee structure, and how to apply to Emerging Edge School of Technology.",
  path: "/admissions",
  keywords: [
    "EEST Admissions",
    "IT Course Eligibility",
    "Summer Training Registration",
    "Tech Bootcamp Fees",
    "Online Course Admissions Pakistan",
    "Student Enrollment Requirements",
  ],
});

export default function AdmissionsPage() {
  return (
    <>
      <FAQSchema faqs={faqs} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Admissions", url: `${SITE_CONFIG.url}/admissions` },
        ]}
      />
      <PageHero
        label="Admissions"
        title="Begin Your Journey"
        description="Affordable skill-based courses — pay module registration fee to join. Progress level by level with full support."
      />
      <AdmissionsSection />
      <FAQSection />
    </>
  );
}
