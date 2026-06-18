import { PageHero } from "@/components/shared/page-hero";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata = createMetadata({
  title: "About Us",
  description:
    "Learn about Emerging Edge School of Technology — our mission, vision, and commitment to industry-focused tech education.",
  path: "/about",
});

const values = [
  {
    title: "Excellence",
    description:
      "We maintain the highest standards in curriculum design, instruction quality, and student outcomes.",
  },
  {
    title: "Innovation",
    description:
      "Our programs evolve with technology, ensuring students learn the most relevant and in-demand skills.",
  },
  {
    title: "Accessibility",
    description:
      "Quality tech education should be accessible. Our level-by-level model makes learning flexible and affordable.",
  },
  {
    title: "Community",
    description:
      "We foster a global community of learners, mentors, and alumni who support each other's growth.",
  },
];

export default function AboutPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "About Us", url: `${SITE_CONFIG.url}/about` },
        ]}
      />
      <PageHero
        label="About Us"
        title="Shaping the Future of Tech Education"
        description="Emerging Edge School of Technology is the educational division of Emerging Edge, dedicated to preparing the next generation of technology leaders."
      />

      <section className="section-padding pt-0">
        <div className="container-custom max-w-4xl">
          <div className="prose max-w-none">
            <div className="rounded-2xl border border-border bg-background p-8 lg:p-12 mb-12 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted leading-relaxed text-lg">
                To bridge the gap between education and industry by providing
                practical, project-based training that prepares students for
                real-world technology careers. We believe in learning by doing,
                guided by experts who have walked the path before.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {values.map((value) => (
                <div key={value.title} className="rounded-xl border border-border bg-background p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-2 text-primary">
                    {value.title}
                  </h3>
                  <p className="text-muted leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-background p-8 lg:p-12 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Why We Exist</h2>
              <p className="text-muted leading-relaxed mb-4">
                The technology industry evolves faster than traditional education
                can keep up. Bootcamps rush students through compressed curricula.
                Universities focus on theory over practice. We saw a need for
                something different — a structured, level-by-level approach that
                ensures mastery while remaining flexible enough for working
                professionals and career changers.
              </p>
              <p className="text-muted leading-relaxed">
                {SITE_CONFIG.name} combines the rigor of academic institutions
                with the practicality of industry training, creating graduates
                who are truly job-ready from day one.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
