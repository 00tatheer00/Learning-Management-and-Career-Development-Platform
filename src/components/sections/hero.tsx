"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          {/* Neumorphic Soft UI Announcement Pill Badge */}
          <div className="mb-8 inline-flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 rounded-full bg-[#edf2f7] dark:bg-[#1a1e26] px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 transition-all duration-300 hover:scale-[1.01] shadow-[8px_8px_20px_rgba(166,180,200,0.45),-8px_-8px_20px_rgba(255,255,255,0.9)] dark:shadow-[8px_8px_20px_rgba(0,0,0,0.6),-8px_-8px_20px_rgba(255,255,255,0.04)] border border-slate-200/60 dark:border-slate-800">
            {/* Live Pulse Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e2e8f0] dark:bg-[#12151c] px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.12),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.04)]">
              <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              ⚡ ADMISSIONS OPEN
            </span>

            {/* Main Text */}
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-sm sm:text-base">
              2nd Module Live Now! 🎉
            </span>

            <span className="hidden sm:inline text-slate-300 dark:text-slate-700 font-light">|</span>

            {/* Secondary Inset Tag */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e2e8f0] dark:bg-[#12151c] px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.12),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.04)]">
              <span>🎬</span> Module 1 Recordings Included
            </span>
          </div>

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
