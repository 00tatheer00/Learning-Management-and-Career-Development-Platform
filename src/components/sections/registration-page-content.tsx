"use client";

import { EnrollmentForm } from "@/components/sections/enrollment-form";
import { RegistrationDetailsSidebar } from "@/components/sections/registration-details-sidebar";

interface RegistrationPageContentProps {
  defaultProgram?: string;
}

export function RegistrationPageContent({
  defaultProgram,
}: RegistrationPageContentProps) {
  return (
    <section className="section-padding section-alt" aria-labelledby="register-heading">
      <div className="container-custom max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 items-start">
          <div className="order-1 lg:order-1 lg:col-span-2">
            <RegistrationDetailsSidebar />
          </div>

          <div className="order-2 lg:order-2 lg:col-span-3 scroll-mt-24" id="register-form">
            <EnrollmentForm defaultProgram={defaultProgram} />
          </div>
        </div>
      </div>
    </section>
  );
}
