"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  PlayCircle,
  GraduationCap,
  Users,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { REGISTRATION_OPEN } from "@/lib/constants";
import { ParticleMeshCanvas } from "@/components/ui/particle-mesh-canvas";

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
      <div className="flex items-center gap-2 mb-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
        </span>
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-400">
          Admissions Closing Soon
        </span>
      </div>

      <div className="flex items-center gap-2 text-white">
        <div className="flex flex-col items-center">
          <div className="flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-2xl bg-slate-900/90 border border-white/10 text-white font-mono text-base sm:text-xl font-black shadow-lg shadow-black/50">
            {pad(days)}
          </div>
          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mt-1">Days</span>
        </div>

        <span className="text-orange-500 font-black text-lg -mt-3.5">:</span>

        <div className="flex flex-col items-center">
          <div className="flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-2xl bg-slate-900/90 border border-white/10 text-white font-mono text-base sm:text-xl font-black shadow-lg shadow-black/50">
            {pad(hours)}
          </div>
          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mt-1">Hours</span>
        </div>

        <span className="text-orange-500 font-black text-lg -mt-3.5">:</span>

        <div className="flex flex-col items-center">
          <div className="flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-2xl bg-slate-900/90 border border-white/10 text-white font-mono text-base sm:text-xl font-black shadow-lg shadow-black/50">
            {pad(minutes)}
          </div>
          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mt-1">Mins</span>
        </div>

        <span className="text-orange-500 font-black text-lg -mt-3.5">:</span>

        <div className="flex flex-col items-center">
          <div className="flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 border border-orange-400/50 text-white font-mono text-base sm:text-xl font-black shadow-lg shadow-orange-500/25 animate-pulse">
            {pad(seconds)}
          </div>
          <span className="text-[9px] font-bold tracking-widest text-orange-400 uppercase mt-1">Secs</span>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const yShift = useTransform(scrollY, [0, 500], [0, 80]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28 bg-[#05070E] text-white"
    >
      {/* 60FPS Interactive Mesh Background */}
      <ParticleMeshCanvas particleCount={50} connectionDistance={140} />

      {/* Radiant Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-orange-500/20 via-amber-500/15 to-violet-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Subtle Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            {/* Top Pill Tag */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-400 backdrop-blur-md mb-6 shadow-lg shadow-orange-500/10"
            >
              <Sparkles className="w-4 h-4 text-orange-400 animate-spin-slow" />
              <span>Emerging Edge School of Technology</span>
            </motion.div>

            {/* Giant Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-balance mb-6"
            >
              Master Tech Skills.
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm">
                100% Free Live Course.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg sm:text-xl text-slate-300 max-w-xl leading-relaxed mb-8 font-normal"
            >
              Join live interactive classes for Web Dev, Mobile App, AI, Video Editing, Digital Marketing & UI/UX. Learn from industry experts and get verified module certificates.
            </motion.p>

            {/* CTA Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              {REGISTRATION_OPEN ? (
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-extrabold rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 shadow-xl shadow-orange-500/30 hover:scale-[1.03] transition-all duration-200" asChild>
                  <Link href="/register" prefetch className="flex items-center justify-center gap-2">
                    <span>Register Now (Free)</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" disabled className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-2xl opacity-60 cursor-not-allowed">
                  Admissions Closed
                </Button>
              )}

              <Button size="lg" variant="ghost" className="w-full sm:w-auto h-14 px-7 text-base font-bold rounded-2xl border border-white/15 bg-white/5 hover:bg-white/15 text-white backdrop-blur-md transition-all" asChild>
                <Link href="/programs" prefetch className="flex items-center justify-center gap-2">
                  <span>Explore Courses</span>
                  <Code2 className="w-5 h-5 text-orange-400" />
                </Link>
              </Button>
            </motion.div>

            {/* Feature Highlights Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/10 w-full max-w-lg"
            >
              <div className="flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Live Classes</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5">Interactive Q&A</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Certificates</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5">Verified Badges</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>LMS Portal</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5">24/7 Access</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Hero Column: Interactive Floating 3D Showcase Card */}
          <motion.div
            style={{ y: yShift }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col items-center"
          >
            <div className="relative w-full max-w-md">

              {/* Glowing Ambient Card Glow */}
              <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 opacity-40 blur-2xl animate-pulse" />

              {/* Main Executive Glass Card */}
              <div className="relative rounded-[2.2rem] border border-white/15 bg-slate-900/85 backdrop-blur-2xl p-6 shadow-2xl overflow-hidden">
                
                {/* Admissions Countdown Header Inside Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-950/80 to-slate-900/80 border border-orange-500/30 mb-6">
                  <AdmissionsCountdownTimer />
                </div>

                {/* Floating Interactive Perks */}
                <div className="space-y-3.5">
                  <motion.div
                    whileHover={{ x: 6 }}
                    className="flex items-center gap-4 p-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      <PlayCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Interactive Live Classes</h4>
                      <p className="text-xs text-slate-400">Join Mon, Tue & Wed live sessions</p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 6 }}
                    className="flex items-center gap-4 p-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Module Certificates</h4>
                      <p className="text-xs text-slate-400">Earn verified digital credentials</p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 6 }}
                    className="flex items-center gap-4 p-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Trainer Mentorship</h4>
                      <p className="text-xs text-slate-400">Direct WhatsApp CRM & feedback</p>
                    </div>
                  </motion.div>
                </div>

                {/* Bottom Quick Action */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Batch 1 Live Enrolling
                  </span>
                  <Link href="/register" className="text-orange-400 font-bold hover:underline flex items-center gap-1">
                    Apply <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
