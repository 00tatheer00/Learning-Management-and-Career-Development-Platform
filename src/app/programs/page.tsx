import { PageHero } from "@/components/shared/page-hero";
import { ProgramCard } from "@/components/shared/program-card";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { LearningJourneySection } from "@/components/sections/learning-journey";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import { programs } from "@/lib/data/programs";

export const metadata = createMetadata({
  title: "Programs",
  description:
    "Explore modular training programs in Web Development, Flutter, AI, Video Editing, Digital Marketing, Graphics Designing, and UI/UX.",
  path: "/programs",
});

export default function ProgramsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Programs", url: `${SITE_CONFIG.url}/programs` },
        ]}
      />
      <PageHero
        label="Programs"
        title="Transform Your Career with Industry-Ready Skills"
        description="Every program is broken into clear modules — each with live classes, defined duration, expert trainers, and a certificate when you complete the module."
      />

      <section className="section-padding pt-0">
        <div className="container-custom">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </div>
      </section>

      <div id="learning-paths">
        <LearningJourneySection />
      </div>
    </>
  );
}
