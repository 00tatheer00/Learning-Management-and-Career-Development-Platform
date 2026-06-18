import { PageHero } from "@/components/shared/page-hero";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { RegistrationPageContent } from "@/components/sections/registration-page-content";
import { createMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import { PAYMENT_CONFIG } from "@/lib/constants/payment";

export const metadata = createMetadata({
  title: "Register",
  description:
    "Register for Emerging Edge School of Technology. Course is 100% free — pay only PKR 1,000 one-time registration fee to join live classes, WhatsApp group, and learning resources.",
  path: "/register",
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
        description={`The course is completely free. Pay only ${PAYMENT_CONFIG.currency} ${PAYMENT_CONFIG.registrationFee.toLocaleString()} one-time registration to join — verified students get WhatsApp group access, live class link, recorded lectures, quizzes, assignments, and projects.`}
      />
      <RegistrationPageContent defaultProgram={program} />
    </>
  );
}
