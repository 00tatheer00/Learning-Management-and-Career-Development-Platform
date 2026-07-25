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
import { Hero3DCanvas } from "@/components/ui/hero-3d-canvas";

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
      className="hero-section relative flex flex-col justify-center min-h-screen overflow-hidden pt-24 pb-28 lg:pt-28 lg:pb-36 bg-gradient-to-b from-slate-950 via-slate-900 to-background text-slate-100"
      aria-labelledby="hero-heading"
    >
      {/* 3D Animated WebGL Canvas Layer (3D Wave Grid Horizon, Floating Geometrics, Interactive Light Beam) */}
      <Hero3DCanvas />

      {/* Subtle Background Glow Spheres */}
      <div
        className="hero-glow pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-orange-500/15 blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="hero-glow pointer-events-none absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="container-custom relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-full max-w-[1140px] flex flex-col items-center">
          {/* 100% Responsive Glassmorphic Announcement Card */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative mb-8 w-full overflow-hidden rounded-2xl sm:rounded-[24px] border border-orange-500/30 bg-slate-900/70 backdrop-blur-xl p-3.5 sm:p-5 shadow-2xl shadow-orange-500/20 text-slate-100 transition-all duration-300 hover:border-orange-400/50 hover:shadow-orange-500/30"
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
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-orange-400">
                  ADMISSIONS OPEN
                </span>
                <div className="flex items-center gap-2.5 sm:gap-3 mt-0.5 sm:mt-1">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-white tracking-tight uppercase leading-none flex flex-row sm:flex-col gap-1 sm:gap-0">
                    <span>2ND</span>
                    <span>MODULE</span>
                  </h2>
                  <span className="font-serif italic font-extrabold text-orange-400 text-xl sm:text-2xl lg:text-3xl leading-none whitespace-nowrap">
                    Live<span className="inline sm:hidden"> </span><br className="hidden sm:inline" />Now!
                  </span>
                </div>
              </div>

              {/* Vertical Divider (Desktop) */}
              <div className="hidden lg:block h-14 w-px bg-slate-800 mx-1" />

              {/* Center Section: Prominent Big Timer */}
              <AdmissionsCountdownTimer />

              {/* Vertical Divider (Desktop) */}
              <div className="hidden lg:block h-14 w-px bg-slate-800 mx-1" />

              {/* Right Action Button Section */}
              <div className="flex flex-col items-center shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-5 sm:px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/35 hover:scale-105 hover:shadow-orange-500/50 transition-all duration-200 w-full sm:w-auto"
                >
                  <span>APPLY NOW</span>
                  <ArrowRight size={14} className="stroke-[3]" />
                </Link>
                <span className="text-[11px] text-slate-400 font-medium mt-1.5 text-center">
                  Seats are <strong className="text-orange-400 font-bold">Limited!</strong>
                </span>
              </div>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6 text-balance text-white"
          >
            Learn Skills Online.
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
              Course is FREE.
            </span>
          </motion.h1>

          {/* Subtitle Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
          >
            Web, App, AI, Video Editing, Digital Marketing, Graphics &amp; UI/UX
            courses. Pay module registration fee to join live interactive classes, assignments, and portal access.
          </motion.p>

          {/* CTA Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 max-w-md sm:max-w-none mx-auto w-full sm:w-auto"
          >
            {REGISTRATION_OPEN ? (
              <Button
                size="lg"
                className="text-base h-14 px-9 font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl shadow-orange-500/25 border-none transition-all duration-200 hover:scale-[1.02]"
                asChild
              >
                <Link href="/register" prefetch>
                  Register Now
                  <ArrowRight className="w-5 h-5 ml-1" aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" disabled className="text-base h-14 px-9 opacity-75 cursor-not-allowed">
                Admissions Closed
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="text-base h-14 px-9 font-semibold border-slate-700 bg-slate-900/60 text-slate-100 hover:bg-slate-800 hover:text-white backdrop-blur-md transition-all duration-200 hover:scale-[1.02]"
              asChild
            >
              <Link href="/programs" prefetch>See All Courses</Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 text-sm text-slate-400"
          >
            Confused? Tap the green <strong className="text-[#25D366] font-bold">Need Help?</strong> button
            at the bottom right corner.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
