"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Code2, Cpu, Palette, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { REGISTRATION_OPEN } from "@/lib/constants";
import { HeroParticleCanvas } from "@/components/ui/hero-particle-canvas";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.215, 0.61, 0.355, 1] },
  },
};

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
      className="hero-section relative flex flex-col justify-center min-h-screen overflow-x-clip pt-24 pb-28 lg:pt-28 lg:pb-36 bg-gradient-to-b from-surface via-background to-surface"
      aria-labelledby="hero-heading"
    >
      {/* Interactive Lightweight Canvas Background */}
      <HeroParticleCanvas />

      {/* Grid Overlay & Glow Effects */}
      <div className="absolute inset-0 hero-grid-wrap pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 hero-grid-lines opacity-40" />
        <div className="absolute inset-0 hero-grid-shimmer" />
      </div>

      <div
        className="hero-glow absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-orange-500/10 via-amber-500/15 to-sky-500/10 blur-[130px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Floating Ambient Tech Badges (Desktop View) */}
      <div className="hidden lg:block pointer-events-none absolute inset-0 max-w-7xl mx-auto z-10">
        {/* Badge 1: Top Left */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[28%] left-4 xl:left-8 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-orange-200/60 dark:border-slate-800 shadow-lg shadow-orange-500/5 text-slate-800 dark:text-slate-200 text-xs font-bold"
        >
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600">
            <Code2 size={16} />
          </div>
          <span>Web &amp; App Development</span>
        </motion.div>

        {/* Badge 2: Top Right */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-[26%] right-4 xl:right-8 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-sky-200/60 dark:border-slate-800 shadow-lg shadow-sky-500/5 text-slate-800 dark:text-slate-200 text-xs font-bold"
        >
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
            <Cpu size={16} />
          </div>
          <span>AI &amp; Automation</span>
        </motion.div>

        {/* Badge 3: Bottom Left */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[28%] left-6 xl:left-12 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-indigo-200/60 dark:border-slate-800 shadow-lg shadow-indigo-500/5 text-slate-800 dark:text-slate-200 text-xs font-bold"
        >
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Palette size={16} />
          </div>
          <span>UI/UX Design</span>
        </motion.div>

        {/* Badge 4: Bottom Right */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-[26%] right-6 xl:right-12 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-emerald-200/60 dark:border-slate-800 shadow-lg shadow-emerald-500/5 text-slate-800 dark:text-slate-200 text-xs font-bold"
        >
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Rocket size={16} />
          </div>
          <span>FullStack MERN</span>
        </motion.div>
      </div>

      <div className="container-custom relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[1140px] flex flex-col items-center"
        >
          {/* 100% Responsive Premium Announcement Card with Animated Border */}
          <motion.div variants={itemVariants} className="w-full max-w-4xl mb-8">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-[24px] border border-orange-300/80 dark:border-orange-500/30 bg-gradient-to-r from-orange-50/90 via-white to-orange-50/70 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-900/90 p-3.5 sm:p-5 shadow-xl shadow-orange-500/10 text-slate-900 dark:text-white backdrop-blur-lg transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20">
              
              {/* Orange Ribbon Tag on Top-Left */}
              <div className="absolute top-0 left-3 sm:left-6 z-10">
                <div className="relative bg-gradient-to-b from-orange-500 to-amber-600 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white shadow-md rounded-b-md flex items-center gap-1">
                  <Sparkles size={11} className="animate-spin-slow" />
                  <span>NEW</span>
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
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 sm:px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200 w-full sm:w-auto"
                    >
                      <span>APPLY NOW</span>
                      <ArrowRight size={14} className="stroke-[3]" />
                    </Link>
                  </motion.div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 text-center">
                    Seats are <strong className="text-orange-600 dark:text-orange-400 font-bold">Limited!</strong>
                  </span>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Animated Headline */}
          <motion.h1
            variants={itemVariants}
            id="hero-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-5 text-balance text-slate-900 dark:text-white"
          >
            Learn Skills Online.
            <br />
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent drop-shadow-sm">
              Course is FREE.
            </span>
          </motion.h1>

          {/* Animated Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed font-normal"
          >
            Web, App, AI, Video Editing, Digital Marketing, Graphics &amp; UI/UX
            courses. Pay module registration fee to join live interactive classes, assignments, and portal access.
          </p>

          {/* Animated Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 max-w-md sm:max-w-none mx-auto"
          >
            {REGISTRATION_OPEN ? (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="text-base h-14 px-8 shadow-xl shadow-orange-500/25 rounded-xl font-bold" asChild>
                  <Link href="/register" prefetch>
                    Register Now
                    <ArrowRight className="w-5 h-5 ml-1" aria-hidden="true" />
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <Button size="lg" disabled className="text-base h-14 px-8 opacity-75 cursor-not-allowed rounded-xl font-bold">
                Admissions Closed
              </Button>
            )}

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" variant="secondary" className="text-base h-14 px-8 rounded-xl font-bold border border-slate-200 dark:border-slate-800" asChild>
                <Link href="/programs" prefetch>See All Courses</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.p variants={itemVariants} className="mt-7 text-sm text-slate-500 dark:text-slate-400">
            Confused? Tap the green <strong className="text-[#25D366] font-bold">Need Help?</strong> button
            at the bottom right corner.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
