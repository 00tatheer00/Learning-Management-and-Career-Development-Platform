import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { BreadcrumbSchema, CourseSchema } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import { programs, getProgramBySlug } from "@/lib/data/programs";

interface ProgramPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return programs.map((program) => ({ slug: program.slug }));
}

export async function generateMetadata({ params }: ProgramPageProps) {
  const { slug } = await params;
  const program = getProgramBySlug(slug);
  if (!program) return {};

  return createMetadata({
    title: program.title,
    description: program.description,
    path: `/programs/${slug}`,
  });
}

export default async function ProgramDetailPage({ params }: ProgramPageProps) {
  const { slug } = await params;
  const program = getProgramBySlug(slug);

  if (!program) notFound();

  return (
    <>
      <CourseSchema
        name={program.title}
        description={program.description}
        slug={program.slug}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Programs", url: `${SITE_CONFIG.url}/programs` },
          { name: program.title, url: `${SITE_CONFIG.url}/programs/${slug}` },
        ]}
      />
      <PageHero
        label={program.category === "active" ? "Active Program" : "Coming Soon"}
        title={program.title}
        description={program.description}
      />

      <section className="section-padding pt-0">
        <div className="container-custom max-w-4xl">
          <div className="flex flex-wrap gap-3 mb-8">
            <Badge variant={program.category === "future" ? "future" : "default"}>
              {program.category === "future" ? "Coming Soon" : "Enrolling Now"}
            </Badge>
            <span className="flex items-center gap-1.5 text-sm text-muted bg-secondary px-3 py-1 rounded-full border border-border">
              <Clock className="w-4 h-4 text-primary" />
              {program.duration}
            </span>
            <span className="text-sm text-muted bg-secondary px-3 py-1 rounded-full border border-border">
              {program.level}
            </span>
          </div>

          {program.levels.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Program Levels</h2>
              <div className="space-y-4">
                {program.levels.map((level, index) => (
                  <div
                    key={level.name}
                    className="rounded-xl border border-border bg-background p-6 flex gap-4 items-start shadow-sm"
                  >
                    <span className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{level.name}</h3>
                      <p className="text-sm text-primary mb-2">{level.duration}</p>
                      <p className="text-muted">{level.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Learning Outcomes</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {program.outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="flex items-start gap-3 rounded-lg border border-border bg-background p-4 shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          {program.category === "active" && (
            <Button size="lg" asChild>
              <Link href="/admissions#enroll">
                Apply for This Program
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          )}
        </div>
      </section>
    </>
  );
}
