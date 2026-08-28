import { PageHero } from "@/components/shared/page-hero";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { RegistrationPageContent } from "@/components/sections/registration-page-content";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Online Admission & Student Registration | EEST Portal",
  description:
    "Apply now for Emerging Edge School of Technology bootcamps. Quick online registration, flexible module-based fee structure, and immediate portal access upon verification.",
  path: "/register",
  keywords: [
    "EEST Course Registration",
    "Apply for IT Bootcamp",
    "Student Course Enrollment",
    "Online Tech Admission Pakistan",
    "Register for Web Development",
    "Register for AI Bootcamp",
  ],
});

interface RegisterPageProps {
  searchParams: Promise<{ program?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { program } = await searchParams;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_CONFIG.url },
          { name: "Register", url: `${SITE_CONFIG.url}/register` },
        ]}
      />
      <PageHero
        label="Student Registration"
        title="Apply & Register Now"
        description="Apply for your course and pay module registration fee to join — verified students get instant portal access, live interactive classes, recorded lectures, quizzes, assignments, and projects."
      />
      <RegistrationPageContent defaultProgram={program} />
    </>
  );
}
