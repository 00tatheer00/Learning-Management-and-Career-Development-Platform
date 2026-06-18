import Link from "next/link";
import { ArrowRight, Clock, BarChart3, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LearningJourneySection } from "@/components/sections/learning-journey";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import { programs } from "@/lib/data/programs";

export const metadata = createMetadata({
  title: "Programs",
  description:
    "Explore our industry-focused training programs in Web Development, App Development, AI, Video Editing, Digital Marketing, Graphics Designing, and UI/UX Designing.",
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
        description="Comprehensive training programs designed with input from leading tech companies."
      />

      <section className="section-padding pt-0">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programs.map((program) => (
              <Card
                key={program.id}
                className="flex flex-col hover:border-primary/30 transition-all duration-300"
              >
                <CardHeader>
                  <Badge
                    variant={program.category === "future" ? "future" : "default"}
                    className="w-fit mb-2"
                  >
                    {program.category === "future" ? "Coming Soon" : "Enrolling Now"}
                  </Badge>
                  <CardTitle>{program.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <p className="text-muted leading-relaxed">{program.description}</p>
                  <div className="flex gap-4 text-sm text-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" />
                      {program.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      {program.level}
                    </span>
                  </div>
                  {program.levels.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {program.levels.map((level) => (
                        <span
                          key={level.name}
                          className="tag"
                        >
                          {level.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <ul className="space-y-2">
                    {program.outcomes.map((outcome) => (
                      <li key={outcome} className="flex items-start gap-2 text-sm text-muted">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {program.category === "active" ? (
                    <Button className="w-full" asChild>
                      <Link href={`/programs/${program.slug}`}>
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button className="w-full" variant="secondary" disabled>
                      Coming Soon
                    </Button>
                  )}
                </CardFooter>
              </Card>
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
