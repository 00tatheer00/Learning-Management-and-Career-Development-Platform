import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { ContactContent } from "@/components/forms/contact-form";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Contact Admissions & Campus Support | EEST School",
  description:
    "Get in touch with Emerging Edge School of Technology for admissions counseling, course fee details, batch timings, and student support. We are here to help.",
  path: "/contact",
  keywords: [
    "Contact EEST",
    "Admissions Helpdesk",
    "EEST Phone and WhatsApp",
    "Course Inquiries",
    "Peshawar Tech Institute Contact",
  ],
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
