"use client";

import Link from "next/link";
import { EnrollmentForm } from "@/components/sections/enrollment-form";
import { RegistrationDetailsSidebar } from "@/components/sections/registration-details-sidebar";
import { REGISTRATION_OPEN } from "@/lib/constants";
import { CalendarBlank, ChatCircleText } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

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
            {REGISTRATION_OPEN ? (
              <EnrollmentForm defaultProgram={defaultProgram} />
            ) : (
              <div className="glass-strong border border-border rounded-2xl p-8 text-center space-y-6 shadow-lg bg-surface/50 backdrop-blur-md">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 mb-2">
                  <CalendarBlank size={32} weight="duotone" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  Registrations Closed
                </h3>
                <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
                  Admissions for the current batch are currently suspended. We are preparing for the next batch and new modules!
                </p>
                <div className="p-4 rounded-xl bg-secondary/50 border border-border/60 text-sm text-muted-foreground text-left max-w-md mx-auto">
                  <p className="font-semibold text-foreground mb-1">What can you do now?</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Explore our courses in detail on the Programs page.</li>
                    <li>Follow us on WhatsApp/Social channels for next batch announcements.</li>
                    <li>If you have queries, contact our admissions support team.</li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Button asChild variant="outline">
                    <Link href="/programs">Explore Programs</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/contact">
                      <ChatCircleText size={18} className="mr-2" />
                      Contact Admissions
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
