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
          {/* 100% Responsive Premium Announcement Card */}
          <div className="relative mb-8 w-full overflow-hidden rounded-2xl sm:rounded-[24px] border border-orange-200/80 bg-gradient-to-r from-orange-50/90 via-white to-orange-50/60 p-3.5 sm:p-5 shadow-xl shadow-orange-500/10 text-slate-900 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/15">
            
            {/* Orange Ribbon Tag on Top-Left */}
            <div className="absolute top-0 left-3 sm:left-6 z-10">
              <div className="relative bg-gradient-to-b from-orange-500 to-amber-600 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white shadow-md rounded-b-md">
                NEW
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 pt-5 sm:pt-2 lg:py-1 pl-3 sm:pl-16 pr-3 sm:pr-4">
              
              {/* Left Title Section */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left shrink-0">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-orange-600">
                  ADMISSIONS OPEN
                </span>
                <div className="flex items-center gap-2.5 sm:gap-3 mt-0.5 sm:mt-1">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none flex flex-row sm:flex-col gap-1 sm:gap-0">
                    <span>2ND</span>
                    <span>MODULE</span>
                  </h2>
                  <span className="font-serif italic font-extrabold text-orange-500 text-xl sm:text-2xl lg:text-3xl leading-none whitespace-nowrap">
                    Live<span className="inline sm:hidden"> </span><br className="hidden sm:inline" />Now!
                  </span>
                </div>
              </div>

              {/* Vertical Divider (Desktop) */}
              <div className="hidden lg:block h-14 w-px bg-slate-200/90 mx-1" />

              {/* Center Features Row - 1 Single Horizontal Row on sm+ and Clean Mobile Stack */}
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 sm:gap-4 lg:gap-6 xl:gap-8 my-1 w-full lg:w-auto">
                
                {/* Feature 1: Module 1 Recordings Included */}
                <div className="flex items-center gap-2 sm:gap-2.5 bg-white/60 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border border-slate-100 sm:border-none shadow-2xs sm:shadow-none">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 shadow-xs">
                    <PlayCircle size={20} className="sm:w-[22px] sm:h-[22px]" weight="fill" />
                  </div>
                  <div className="text-left text-[11px] sm:text-xs leading-tight whitespace-nowrap">
                    <p className="font-extrabold text-slate-900">Module 1</p>
                    <p className="text-slate-500 font-medium">Recordings Included</p>
                  </div>
                </div>

                {/* Feature 2: Learn from Experts */}
                <div className="flex items-center gap-2 sm:gap-2.5 bg-white/60 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border border-slate-100 sm:border-none shadow-2xs sm:shadow-none">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xs">
                    <GraduationCap size={20} className="sm:w-[22px] sm:h-[22px]" weight="duotone" />
                  </div>
                  <div className="text-left text-[11px] sm:text-xs leading-tight whitespace-nowrap">
                    <p className="text-slate-500 font-medium">Learn from</p>
                    <p className="font-extrabold text-slate-900">Experts</p>
                  </div>
                </div>

                {/* Feature 3: Upgrade Your Future */}
                <div className="flex items-center gap-2 sm:gap-2.5 bg-white/60 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border border-slate-100 sm:border-none shadow-2xs sm:shadow-none">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 shadow-xs">
                    <RocketLaunch size={20} className="sm:w-[22px] sm:h-[22px]" weight="duotone" />
                  </div>
                  <div className="text-left text-[11px] sm:text-xs leading-tight whitespace-nowrap">
                    <p className="text-slate-500 font-medium">Upgrade Your</p>
                    <p className="font-extrabold text-slate-900">Future</p>
                  </div>
                </div>

              </div>

              {/* Vertical Divider (Desktop) */}
              <div className="hidden lg:block h-14 w-px bg-slate-200/90 mx-1" />

              {/* Right Action Button Section */}
              <div className="flex flex-col items-center shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 sm:px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/30 hover:scale-105 hover:shadow-orange-500/40 transition-all duration-200 w-full sm:w-auto"
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
