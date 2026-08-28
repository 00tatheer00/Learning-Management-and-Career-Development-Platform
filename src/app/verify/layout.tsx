import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = createMetadata({
  title: "Verify Certificate & Credentials Registry",
  description:
    "Verify official student certificates and academic credentials issued by Emerging Edge School of Technology. Instant, cryptographic verification for employers and institutions.",
  path: "/verify",
  keywords: [
    "Verify EEST Certificate",
    "Certificate Verification Registry",
    "Student Credential Check",
    "Emerging Edge Certificate Validation",
    "Authentic Tech Certifications",
  ],
});

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Verify Credentials", url: `${SITE_CONFIG.url}/verify` },
        ]}
      />
      {children}
    </>
  );
}
