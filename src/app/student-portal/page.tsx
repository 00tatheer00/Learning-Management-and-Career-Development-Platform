import { PageHero } from "@/components/shared/page-hero";
import { StudentPortalFeatures } from "@/components/sections/student-portal-features";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Student Portal",
  description:
    "Access your courses, assignments, progress tracking, and community resources in the EEST Student Portal.",
  path: "/student-portal",
});

export default function StudentPortalPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Student Portal", url: `${SITE_CONFIG.url}/student-portal` },
        ]}
      />
      <PageHero
        label="Student Portal"
        title="Your Learning Hub"
        description="Access courses, track progress, join live sessions, and connect with your learning community."
      />

      <section className="section-padding pt-0">
        <div className="container-custom max-w-4xl">
          <div className="rounded-2xl border border-border bg-background p-8 lg:p-12 text-center mb-12 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Sign In to Continue</h2>
            <p className="text-muted mb-6 max-w-lg mx-auto">
              Enrolled students can access the full portal with their credentials.
              New students will receive login details after enrollment confirmation.
            </p>
            <Button size="lg" disabled>
              Student Login — Coming Soon
            </Button>
          </div>

          <StudentPortalFeatures />
        </div>
      </section>
    </>
  );
}
