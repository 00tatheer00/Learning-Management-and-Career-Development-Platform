import { PageHero } from "@/components/shared/page-hero";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { AdmissionsSection } from "@/components/sections/admissions";
import { EnrollmentFormSection } from "@/components/sections/enrollment-form";
import { FAQSection } from "@/components/sections/faq";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Admissions",
  description:
    "Learn about our registration-based learning model, eligibility requirements, and how to apply to Emerging Edge School of Technology.",
  path: "/admissions",
});

export default function AdmissionsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Admissions", url: `${SITE_CONFIG.url}/admissions` },
        ]}
      />
      <PageHero
        label="Admissions"
        title="Begin Your Journey"
        description="Free course — pay only PKR 1,000 one-time registration to join. Progress level by level with full support."
      />
      <AdmissionsSection />
      <EnrollmentFormSection />
      <FAQSection />
    </>
  );
}
