import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { ContactContent } from "@/components/forms/contact-form";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Contact Admissions & Campus Team | EEST School",
  description:
    "Get in touch with Emerging Edge School of Technology for admissions counseling, course fee details, batch timings, and student support.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Contact", url: `${SITE_CONFIG.url}/contact` },
        ]}
      />
      <ContactContent />
    </>
  );
}
