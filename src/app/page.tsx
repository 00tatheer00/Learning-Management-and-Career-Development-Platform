import type { Metadata } from "next";
import { FAQSchema, IdentitySchema, OrganizationSchema, LocalBusinessSchema } from "@/components/seo/json-ld";
import { faqs } from "@/lib/data/faqs";
import { HeroSection } from "@/components/sections/hero";
import { StatsSection } from "@/components/sections/stats";
import { ProgramsSection } from "@/components/sections/programs";
import { StudentProjectsSection } from "@/components/sections/student-projects";
import { WhyChooseUsSection } from "@/components/sections/why-choose-us";
import { LearningJourneySection } from "@/components/sections/learning-journey";
import { TrainersSection } from "@/components/sections/trainers";
import { AdmissionsSection } from "@/components/sections/admissions";
import { FAQSection } from "@/components/sections/faq";
import { CTASection } from "@/components/sections/cta";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = createMetadata({
  title: `${SITE_CONFIG.name} | Web Development, AI, App Dev & IT Bootcamps`,
  description:
    "Launch your tech career with Emerging Edge School of Technology. Hands-on practical training in Full-Stack Web Development, AI & Machine Learning, Flutter Apps, Video Editing, UI/UX, and Digital Marketing with verified certifications.",
  path: "/",
  keywords: [
    "Tech Bootcamps in Pakistan",
    "Full Stack Web Development",
    "AI and Machine Learning Courses",
    "Flutter App Development Training",
    "UI UX Design Courses Figma",
    "Video Editing Premiere Pro",
    "Digital Marketing Certification",
    "Verified Tech Certifications",
    "Live Online Tech Classes",
  ],
});

export default function HomePage() {
  return (
    <>
      <OrganizationSchema />
      <IdentitySchema />
      <LocalBusinessSchema />
      <FAQSchema faqs={faqs} />
      <HeroSection />
      <StatsSection />
      <AdmissionsSection />
      <TrainersSection />
      <ProgramsSection />
      <StudentProjectsSection />
      <WhyChooseUsSection />
      <LearningJourneySection />
      <FAQSection />
      <CTASection />
    </>
  );
}
