import Image from "next/image";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/shared/social-icons";
import { PageHero } from "@/components/shared/page-hero";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { Card, CardContent } from "@/components/ui/card";
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trainers.map((trainer) => (
              <Card key={trainer.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0">
                    <Image
                      src={trainer.image}
                      alt={trainer.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 192px"
                    />
                  </div>
                  <CardContent className="p-6 flex-1">
                    <h2 className="text-xl font-bold mb-1">{trainer.name}</h2>
                    <p className="text-primary text-sm mb-1">{trainer.designation}</p>
                    <p className="text-xs text-muted mb-3">
                      {trainer.experience} experience
                    </p>
                    <p className="text-sm text-muted mb-4 leading-relaxed">
                      {trainer.bio}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {trainer.expertise.map((skill) => (
                        <span
                          key={skill}
                          className="tag"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      {trainer.social.linkedin && (
                        <a
                          href={trainer.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted hover:text-primary transition-colors"
                          aria-label={`${trainer.name} on LinkedIn`}
                        >
                          <LinkedinIcon className="w-5 h-5" />
                        </a>
                      )}
                      {trainer.social.github && (
                        <a
                          href={trainer.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted hover:text-primary transition-colors"
                          aria-label={`${trainer.name} on GitHub`}
                        >
                          <GithubIcon className="w-5 h-5" />
                        </a>
                      )}
                      {trainer.social.twitter && (
                        <a
                          href={trainer.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted hover:text-primary transition-colors"
                          aria-label={`${trainer.name} on Twitter`}
                        >
                          <TwitterIcon className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
