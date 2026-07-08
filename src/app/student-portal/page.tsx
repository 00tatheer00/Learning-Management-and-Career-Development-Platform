import Link from "next/link";
import { PageHero } from "@/components/shared/page-hero";
import { SiteLogo } from "@/components/shared/site-logo";
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
        action={
          <Button size="lg" asChild>
            <Link href="/login">Student Login</Link>
          </Button>
        }
      />

      <section className="section-padding pt-0 -mt-4">
        <div className="container-custom max-w-4xl">
          <div className="rounded-2xl border border-border bg-background p-6 lg:p-8 text-center mb-12 shadow-sm">
            <div className="flex justify-center mb-4">
              <SiteLogo variant="login" href={null} className="!h-14 sm:!h-16" />
            </div>
            <h2 className="text-xl font-bold mb-2">Sign In to Continue</h2>
            <p className="text-muted max-w-lg mx-auto text-sm sm:text-base">
              Enrolled students can access the full portal with their credentials.
              New students will receive login details after enrollment confirmation.
            </p>
          </div>

          <StudentPortalFeatures />
        </div>
      </section>
    </>
  );
}
