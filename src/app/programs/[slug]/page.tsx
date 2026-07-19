import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Layers } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { ProgramSyllabusSection } from "@/components/shared/program-syllabus-section";
import { ProgramModuleTimeline } from "@/components/shared/program-module-timeline";
import { ModuleCertificateBadge } from "@/components/shared/module-certificate-badge";
import { ModuleCertificateCallout } from "@/components/shared/module-certificate-callout";
import { TrainerCard } from "@/components/shared/trainer-card";
import { BreadcrumbSchema, CourseSchema } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG, REGISTRATION_OPEN } from "@/lib/constants";
import { programs, getProgramBySlug, getProgramTopicCount, programHasSyllabus } from "@/lib/data/programs";
import { getTrainersByProgramSlug } from "@/lib/data/trainers";

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

  const trainers = getTrainersByProgramSlug(program.slug);
  const isActive = program.category === "active";

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
        label={isActive ? "Active Program" : "Coming Soon"}
        title={program.title}
        description={program.description}
      />

      <section className="section-padding pt-0">
        <div className="container-custom max-w-5xl">
          <div className="mb-10 flex flex-wrap gap-3">
            <Badge variant={isActive ? "default" : "future"}>
              {isActive ? "Enrolling Now" : "Coming Soon"}
            </Badge>
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-sm text-muted">
              <Clock className="h-4 w-4 text-primary" />
              {program.duration}
            </span>
            <span className="rounded-full border border-border bg-secondary px-3 py-1 text-sm text-muted">
              {program.level}
            </span>
            {program.modules.length > 0 && (
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-sm text-muted">
                <Layers className="h-4 w-4 text-primary" />
                {program.modules.length} modules
              </span>
            )}
            {programHasSyllabus(program) && (
              <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                {getProgramTopicCount(program)} topics
              </span>
            )}
            {program.modules.length > 0 && <ModuleCertificateBadge />}
          </div>

          {program.modules.length > 0 && <ModuleCertificateCallout />}

          {programHasSyllabus(program) ? (
            <ProgramSyllabusSection program={program} />
          ) : program.modules.length > 0 ? (
            <div className="mb-14">
              <div className="mb-6">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
                  Curriculum
                </p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Program Modules</h2>
                <p className="mt-2 max-w-2xl text-muted">
                  Each module includes live classes — typically 3 days per week, 1.5 hours per class.
                </p>
              </div>
              <ProgramModuleTimeline modules={program.modules} />
            </div>
          ) : null}

          <div className="mb-14">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
                Outcomes
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">What You Will Learn</h2>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {program.outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background p-4 shadow-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-muted">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          {trainers.length > 0 && (
            <div className="mb-14">
              <div className="mb-6">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
                  Your Mentors
                </p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Program Trainers</h2>
                <p className="mt-2 max-w-2xl text-muted">
                  Learn directly from specialists guiding this program at EEST.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {trainers.map((trainer) => (
                  <TrainerCard key={trainer.id} trainer={trainer} skillLimit={4} />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            {REGISTRATION_OPEN ? (
              isActive ? (
                <Button size="lg" asChild>
                  <Link href={`/register?program=${program.slug}`}>
                    Apply for This Program
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register">
                    Register for Open Programs
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              )
            ) : (
              <Button size="lg" disabled className="opacity-75 cursor-not-allowed">
                Admissions Closed (Next Batch Coming Soon)
              </Button>
            )}
            <Button size="lg" variant="outline" asChild>
              <Link href="/programs">View All Programs</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
