import { PageHero } from "@/components/shared/page-hero";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description: "Privacy Policy for Emerging Edge School of Technology.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero label="Legal" title="Privacy Policy" />
      <section className="section-padding pt-0">
        <div className="container-custom max-w-3xl prose">
          <div className="rounded-2xl border border-border bg-background p-8 lg:p-12 space-y-6 text-muted leading-relaxed shadow-sm">
            <p>Last updated: June 18, 2026</p>
            <h2 className="text-xl font-bold text-foreground">Information We Collect</h2>
            <p>
              We collect information you provide directly, including name, email, phone
              number, and enrollment details when you apply to our programs.
            </p>
            <h2 className="text-xl font-bold text-foreground">How We Use Your Information</h2>
            <p>
              Your information is used to process applications, provide educational
              services, communicate about programs, and improve our offerings.
            </p>
            <h2 className="text-xl font-bold text-foreground">Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal
              information from unauthorized access, alteration, or disclosure.
            </p>
            <h2 className="text-xl font-bold text-foreground">Contact Us</h2>
            <p>
              For privacy-related inquiries, contact us at admissions@emergingedge.com.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
