import { PageHero } from "@/components/shared/page-hero";
import { TrainerCard } from "@/components/shared/trainer-card";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import { trainers } from "@/lib/data/trainers";

export const metadata = createMetadata({
  title: "Trainers",
  description:
    "Meet our expert trainers and mentors — industry professionals from top tech companies guiding your learning journey.",
  path: "/trainers",
});

export default function TrainersPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Trainers", url: `${SITE_CONFIG.url}/trainers` },
        ]}
      />
      <PageHero
        label="Our Team"
        title="Expert Mentors & Trainers"
        description="Learn from industry leaders who bring decades of combined experience from top technology companies."
      />

      <section className="section-padding pt-0">
        <div className="container-custom">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8">
            {trainers.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} variant="detailed" skillLimit={99} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
