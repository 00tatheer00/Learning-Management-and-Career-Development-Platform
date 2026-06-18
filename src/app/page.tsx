import dynamic from "next/dynamic";
import { FAQSchema } from "@/components/seo/json-ld";
import { faqs } from "@/lib/data/faqs";

const HeroSection = dynamic(() =>
  import("@/components/sections/hero").then((m) => ({ default: m.HeroSection }))
);
const StatsSection = dynamic(() =>
  import("@/components/sections/stats").then((m) => ({ default: m.StatsSection }))
);
const ProgramsSection = dynamic(() =>
  import("@/components/sections/programs").then((m) => ({ default: m.ProgramsSection }))
);
const WhyChooseUsSection = dynamic(() =>
  import("@/components/sections/why-choose-us").then((m) => ({
    default: m.WhyChooseUsSection,
  }))
);
const LearningJourneySection = dynamic(() =>
  import("@/components/sections/learning-journey").then((m) => ({
    default: m.LearningJourneySection,
  }))
);
const TrainersSection = dynamic(() =>
  import("@/components/sections/trainers").then((m) => ({ default: m.TrainersSection }))
);
const TestimonialsSection = dynamic(() =>
  import("@/components/sections/testimonials").then((m) => ({
    default: m.TestimonialsSection,
  }))
);
const AdmissionsSection = dynamic(() =>
  import("@/components/sections/admissions").then((m) => ({
    default: m.AdmissionsSection,
  }))
);
const FAQSection = dynamic(() =>
  import("@/components/sections/faq").then((m) => ({ default: m.FAQSection }))
);
const CTASection = dynamic(() =>
  import("@/components/sections/cta").then((m) => ({ default: m.CTASection }))
);

export default function HomePage() {
  return (
    <>
      <FAQSchema faqs={faqs} />
      <HeroSection />
      <StatsSection />
      <ProgramsSection />
      <WhyChooseUsSection />
      <LearningJourneySection />
      <TrainersSection />
      <TestimonialsSection />
      <AdmissionsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
