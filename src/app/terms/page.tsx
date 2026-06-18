import { PageHero } from "@/components/shared/page-hero";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Terms of Service",
  description: "Terms of Service for Emerging Edge School of Technology.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageHero label="Legal" title="Terms of Service" />
      <section className="section-padding pt-0">
        <div className="container-custom max-w-3xl">
          <div className="rounded-2xl border border-border bg-background p-8 lg:p-12 space-y-6 text-muted leading-relaxed shadow-sm">
            <p>Last updated: June 18, 2026</p>
            <h2 className="text-xl font-bold text-foreground">Acceptance of Terms</h2>
            <p>
              By accessing and using Emerging Edge School of Technology services, you
              agree to be bound by these Terms of Service.
            </p>
            <h2 className="text-xl font-bold text-foreground">Educational Services</h2>
            <p>
              Our programs are provided on a level-by-level registration basis. Students
              must complete assessments before advancing to subsequent levels.
            </p>
            <h2 className="text-xl font-bold text-foreground">Intellectual Property</h2>
            <p>
              Course materials, curricula, and platform content are the intellectual
              property of Emerging Edge School of Technology and may not be reproduced
              without permission.
            </p>
            <h2 className="text-xl font-bold text-foreground">Refund Policy</h2>
            <p>
              Refund policies vary by program level. Please contact admissions for
              specific refund terms applicable to your enrollment.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
