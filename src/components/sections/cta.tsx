"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FreeCoursePromo } from "@/components/shared/free-course-promo";
import { PAYMENT_CONFIG } from "@/lib/constants/payment";

export function CTASection() {
  return (
    <section className="section-padding" aria-labelledby="cta-heading">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-primary/5"
            aria-hidden="true"
          />
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"
            aria-hidden="true"
          />

          <div className="relative z-10 px-4 sm:px-8 py-12 sm:py-16 lg:py-20 text-center">
            <div className="flex justify-center mb-6">
              <FreeCoursePromo variant="compact" />
            </div>
            <h2 id="cta-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Start Building Your{" "}
              <span className="gradient-text">Future Today</span>
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
              The course is completely free. Register now with just{" "}
              {PAYMENT_CONFIG.currency} {PAYMENT_CONFIG.registrationFee.toLocaleString()}{" "}
              and begin your journey with expert mentorship.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">
                  Apply Now
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                  Contact Admissions
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
