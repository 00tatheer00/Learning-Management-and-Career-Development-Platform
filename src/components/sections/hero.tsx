"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PlayCircle, GraduationCap, RocketLaunch } from "@phosphor-icons/react";
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
        <div className="w-full max-w-[1140px] flex flex-col items-center">
          {/* Exact Premium Announcement Card matching user mockup */}
          <div className="relative mb-8 w-full overflow-hidden rounded-[24px] border border-orange-200/80 bg-gradient-to-r from-orange-50/80 via-white to-orange-50/50 p-4 sm:p-5 shadow-xl shadow-orange-500/10 text-slate-900 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/15">
            
            {/* Orange Ribbon Tag on Top-Left */}
            <div className="absolute top-0 left-5 sm:left-6 z-10">
              <div className="relative bg-gradient-to-b from-orange-500 to-amber-600 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white shadow-md rounded-b-md">
                NEW
              </div>
            </div>

            <div className="flex flex-col xl:flex-row items-center justify-between gap-4 sm:gap-6 pl-12 sm:pl-16 pr-2 sm:pr-4 py-1">
              
              {/* Left Title Section */}
              <div className="flex flex-col text-left shrink-0">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-600">
                  ADMISSIONS OPEN
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none flex flex-col">
                    <span>2ND</span>
                    <span>MODULE</span>
                  </h2>
                  <span className="font-serif italic font-extrabold text-orange-500 text-2xl sm:text-3xl leading-none whitespace-nowrap">
                    Live<br />Now!
                  </span>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="hidden xl:block h-14 w-px bg-slate-200/90 mx-1" />

              {/* Center Features Row - Strictly 1 Single Horizontal Row */}
              <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-4 sm:gap-5 lg:gap-6 xl:gap-8 my-1 shrink-0">
                {/* Feature 1: Module 1 Recordings Included */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 shadow-xs">
                    <PlayCircle size={22} weight="fill" />
                  </div>
                  <div className="text-left text-xs leading-tight whitespace-nowrap">
                    <p className="font-extrabold text-slate-900">Module 1</p>
                    <p className="text-slate-500 font-medium">Recordings Included</p>
                  </div>
                </div>

                {/* Feature 2: Learn from Experts */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xs">
                    <GraduationCap size={22} weight="duotone" />
                  </div>
                  <div className="text-left text-xs leading-tight whitespace-nowrap">
                    <p className="text-slate-500 font-medium">Learn from</p>
                    <p className="font-extrabold text-slate-900">Experts</p>
                  </div>
                </div>

                {/* Feature 3: Upgrade Your Future */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 shadow-xs">
                    <RocketLaunch size={22} weight="duotone" />
                  </div>
                  <div className="text-left text-xs leading-tight whitespace-nowrap">
                    <p className="text-slate-500 font-medium">Upgrade Your</p>
                    <p className="font-extrabold text-slate-900">Future</p>
                  </div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="hidden xl:block h-14 w-px bg-slate-200/90 mx-1" />

              {/* Right Action Button Section */}
              <div className="flex flex-col items-center shrink-0">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/30 hover:scale-105 hover:shadow-orange-500/40 transition-all duration-200"
                >
                  <span>APPLY NOW</span>
                  <ArrowRight size={14} className="stroke-[3]" />
                </Link>
                <span className="text-[11px] text-slate-500 font-medium mt-1.5 text-center">
                  Seats are <strong className="text-orange-600 font-bold">Limited!</strong>
                </span>
              </div>

            </div>
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
