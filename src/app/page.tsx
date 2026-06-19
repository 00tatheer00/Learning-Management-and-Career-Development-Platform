import { FAQSchema } from "@/components/seo/json-ld";
import { faqs } from "@/lib/data/faqs";
import { HeroSection } from "@/components/sections/hero";
import { StatsSection } from "@/components/sections/stats";
import { ProgramsSection } from "@/components/sections/programs";
import { WhyChooseUsSection } from "@/components/sections/why-choose-us";
import { LearningJourneySection } from "@/components/sections/learning-journey";
import { TrainersSection } from "@/components/sections/trainers";
import { AdmissionsSection } from "@/components/sections/admissions";
import { FAQSection } from "@/components/sections/faq";
import { CTASection } from "@/components/sections/cta";

export default function HomePage() {
  return (
    <>
      <FAQSchema faqs={faqs} />
      <HeroSection />
      <StatsSection />
      <AdmissionsSection />
      <TrainersSection />
      <ProgramsSection />
      <WhyChooseUsSection />
      <LearningJourneySection />
      <FAQSection />
      <CTASection />
    </>
  );
}
