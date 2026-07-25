"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PlayCircle, GraduationCap, RocketLaunch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PAYMENT_CONFIG } from "@/lib/constants/payment";
import { REGISTRATION_OPEN } from "@/lib/constants";

function useCountdown(targetDateIso: string) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const target = new Date(targetDateIso).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDateIso]);

  return timeLeft;
}

function AdmissionsCountdownTimer() {
  const { days, hours, minutes, seconds, isExpired } = useCountdown("2026-07-31T23:59:59+05:00");

  if (isExpired) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex flex-col items-center justify-center my-1 sm:my-0">
      {/* Sleek Header Badge */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600" />
        </span>
        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">
          Admissions Close July 31
        </span>
      </div>

      {/* Professional Executive Timer Cards */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-slate-900">
        {/* Days */}
        <div className="flex flex-col items-center">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-slate-900 text-white font-mono text-sm sm:text-lg font-black shadow-md shadow-slate-900/10 border border-slate-800">
            {pad(days)}
          </div>
          <span className="text-[9px] font-extrabold tracking-wider text-slate-500 uppercase mt-1">Days</span>
        </div>

        <span className="text-slate-400 font-bold text-sm sm:text-base -mt-3.5">:</span>

        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-slate-900 text-white font-mono text-sm sm:text-lg font-black shadow-md shadow-slate-900/10 border border-slate-800">
            {pad(hours)}
          </div>
          <span className="text-[9px] font-extrabold tracking-wider text-slate-500 uppercase mt-1">Hours</span>
        </div>

        <span className="text-slate-400 font-bold text-sm sm:text-base -mt-3.5">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-slate-900 text-white font-mono text-sm sm:text-lg font-black shadow-md shadow-slate-900/10 border border-slate-800">
            {pad(minutes)}
          </div>
          <span className="text-[9px] font-extrabold tracking-wider text-slate-500 uppercase mt-1">Mins</span>
        </div>

        <span className="text-slate-400 font-bold text-sm sm:text-base -mt-3.5">:</span>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-b from-orange-500 to-amber-600 text-white font-mono text-sm sm:text-lg font-black shadow-md shadow-orange-500/20 border border-orange-400 animate-pulse">
            {pad(seconds)}
          </div>
          <span className="text-[9px] font-extrabold tracking-wider text-orange-600 uppercase mt-1">Secs</span>
        </div>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { ParticleMeshCanvas } from "@/components/ui/particle-mesh-canvas";

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
      className="hero-section relative flex flex-col justify-center min-h-screen overflow-hidden pt-24 pb-28 lg:pt-28 lg:pb-36 bg-gradient-to-b from-surface via-background to-surface"
      aria-labelledby="hero-heading"
    >
      {/* 60FPS Interactive Canvas Background */}
      <ParticleMeshCanvas particleCount={40} connectionDistance={130} />

      <div className="absolute inset-0 hero-grid-wrap pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 hero-grid-lines opacity-40" />
        <div className="absolute inset-0 hero-grid-shimmer" />
      </div>
      <div
        className="hero-glow absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-orange-500/15 via-amber-500/10 to-transparent blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="container-custom relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 text-center pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[1140px] flex flex-col items-center"
        >
          {/* 100% Responsive Premium Announcement Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative mb-8 w-full overflow-hidden rounded-2xl sm:rounded-[24px] border border-orange-200/80 dark:border-orange-500/30 bg-gradient-to-r from-orange-50/90 via-white to-orange-50/60 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-900/90 p-3.5 sm:p-5 shadow-xl shadow-orange-500/10 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:border-orange-400/80"
          >
            
            {/* Orange Ribbon Tag on Top-Left */}
            <div className="absolute top-0 left-3 sm:left-6 z-10">
              <div className="relative bg-gradient-to-b from-orange-500 to-amber-600 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white shadow-md rounded-b-md">
                NEW
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 pt-5 sm:pt-2 lg:py-1 pl-3 sm:pl-16 pr-3 sm:pr-4">
              
              {/* Left Title Section */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left shrink-0">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-400">
                  ADMISSIONS OPEN
                </span>
                <div className="flex items-center gap-2.5 sm:gap-3 mt-0.5 sm:mt-1">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none flex flex-row sm:flex-col gap-1 sm:gap-0">
                    <span>2ND</span>
                    <span>MODULE</span>
                  </h2>
                  <span className="font-serif italic font-extrabold text-orange-500 text-xl sm:text-2xl lg:text-3xl leading-none whitespace-nowrap">
                    Live<span className="inline sm:hidden"> </span><br className="hidden sm:inline" />Now!
                  </span>
                </div>
              </div>

              {/* Vertical Divider (Desktop) */}
              <div className="hidden lg:block h-14 w-px bg-slate-200/90 dark:bg-slate-800 mx-1" />

              {/* Center Section: Prominent Big Timer */}
              <AdmissionsCountdownTimer />

              {/* Vertical Divider (Desktop) */}
              <div className="hidden lg:block h-14 w-px bg-slate-200/90 dark:bg-slate-800 mx-1" />

              {/* Right Action Button Section */}
              <div className="flex flex-col items-center shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-5 sm:px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/30 hover:scale-105 hover:shadow-orange-500/40 transition-all duration-200 w-full sm:w-auto"
                >
                  <span>APPLY NOW</span>
                  <ArrowRight size={14} className="stroke-[3]" />
                </Link>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 text-center">
                  Seats are <strong className="text-orange-600 dark:text-orange-400 font-bold">Limited!</strong>
                </span>
              </div>

            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            id="hero-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-5 text-balance"
          >
            Learn Skills Online.
            <br />
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">
              Course is FREE.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Web, App, AI, Video Editing, Digital Marketing, Graphics &amp; UI/UX
            courses. Pay module registration fee to join live interactive classes, assignments, and portal access.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md sm:max-w-none mx-auto"
          >
            {REGISTRATION_OPEN ? (
              <Button size="lg" className="text-base h-14 px-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all" asChild>
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
            <Button size="lg" variant="secondary" className="text-base h-14 backdrop-blur-md border border-slate-200/80 dark:border-slate-800" asChild>
              <Link href="/programs" prefetch>See All Courses</Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-sm text-muted"
          >
            Confused? Tap the green <strong className="text-[#25D366]">Need Help?</strong> button
            at the bottom right corner.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
