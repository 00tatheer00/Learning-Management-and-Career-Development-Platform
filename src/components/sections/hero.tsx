"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FreeCoursePromo } from "@/components/shared/free-course-promo";
import { PAYMENT_CONFIG } from "@/lib/constants/payment";
import { REGISTRATION_OPEN } from "@/lib/constants";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        section.classList.toggle("hero-in-view", entry.isIntersecting);
      },
      { threshold: 0.05, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-section relative flex flex-col justify-center min-h-screen overflow-x-clip pt-24 pb-28 lg:pt-28 lg:pb-36 bg-gradient-to-b from-surface to-background"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 hero-grid-wrap" aria-hidden="true">
        <div className="absolute inset-0 hero-grid-lines" />
        <div className="absolute inset-0 hero-grid-shimmer" />
      </div>
      <div
        className="hero-glow absolute top-1/4 left-1/2 w-[560px] h-[560px] rounded-full bg-primary/10 blur-[100px]"
        aria-hidden="true"
      />

      <div className="container-custom relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-full max-w-4xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-gradient-to-r from-emerald-500/20 via-primary/15 to-emerald-500/20 px-4 py-1.5 text-xs sm:text-sm font-extrabold text-emerald-800 dark:text-emerald-300 mb-4 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            🔥 ADMISSIONS ARE NOW OPEN FOR 2nd MODULE! 🎉
          </div>

          <FreeCoursePromo variant="compact" className="mb-6" />

          <h1
            id="hero-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] mb-5 text-balance"
          >
            Learn Skills Online.
            <br />
            <span className="gradient-text">Course is FREE.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            Web, App, AI, Video Editing, Digital Marketing, Graphics &amp; UI/UX
            courses. Pay only{" "}
            <strong className="text-foreground">
              Rs {PAYMENT_CONFIG.registrationFee.toLocaleString()}
            </strong>{" "}
            once to join. Classes are online on WhatsApp.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md sm:max-w-none mx-auto">
            {REGISTRATION_OPEN ? (
              <Button size="lg" className="text-base h-14 px-8" asChild>
                <Link href="/register" prefetch>
                  Register Now
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" disabled className="text-base h-14 px-8 opacity-75 cursor-not-allowed">
                Admissions Closed
              </Button>
            )}
            <Button size="lg" variant="secondary" className="text-base h-14" asChild>
              <Link href="/programs" prefetch>See All Courses</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted">
            Confused? Tap the green <strong className="text-[#25D366]">Need Help?</strong> button
            at the bottom right corner.
          </p>
        </div>
      </div>
    </section>
  );
}
