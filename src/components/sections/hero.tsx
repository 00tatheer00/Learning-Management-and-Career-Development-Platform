"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Code2, Cpu, Palette, Megaphone } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { REGISTRATION_OPEN } from "@/lib/constants";

const HeroParticleCanvas = dynamic(
  () => import("@/components/ui/hero-particle-canvas").then((m) => m.HeroParticleCanvas),
  { ssr: false }
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
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
      className="hero-section relative flex flex-col justify-center min-h-screen overflow-x-clip pt-28 pb-28 lg:pt-36 lg:pb-36 bg-gradient-to-b from-surface via-background to-surface"
      aria-labelledby="hero-heading"
    >
      {/* Interactive Lightweight Canvas Background */}
      <HeroParticleCanvas />

      {/* Grid Overlay & Glow Effects */}
      <div className="absolute inset-0 hero-grid-wrap pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 hero-grid-lines opacity-45" />
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
          className="absolute top-[28%] left-4 xl:left-8 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-orange-200/80 shadow-xl shadow-orange-500/10 text-slate-900 text-xs font-black"
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
          className="absolute top-[26%] right-4 xl:right-8 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-sky-200/80 shadow-xl shadow-sky-500/10 text-slate-900 text-xs font-black"
        >
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600">
            <Cpu size={16} />
          </div>
          <span>AI &amp; Automation</span>
        </motion.div>

        {/* Badge 3: Bottom Left */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[28%] left-6 xl:left-12 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-indigo-200/80 shadow-xl shadow-indigo-500/10 text-slate-900 text-xs font-black"
        >
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
            <Palette size={16} />
          </div>
          <span>UI/UX Design</span>
        </motion.div>

        {/* Badge 4: Bottom Right */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-[26%] right-6 xl:right-12 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-200/80 shadow-xl shadow-emerald-500/10 text-slate-900 text-xs font-black"
        >
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
            <Megaphone size={16} />
          </div>
          <span>Digital Marketing with AI</span>
        </motion.div>
      </div>

      <div className="container-custom relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[1140px] flex flex-col items-center"
        >
          {/* ═══ DIGITAL MARKETING WITH AI LAUNCH BANNER ═══ */}
          <motion.div variants={itemVariants} className="mb-5">
            <Link
              href="/programs/digital-marketing"
              className="group relative inline-flex items-center gap-3 px-5 py-2.5 rounded-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/15 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fef3c7 100%)",
                border: "1px solid rgba(234,88,12,0.18)",
                boxShadow: "0 2px 12px rgba(234,88,12,0.08)",
              }}
            >
              {/* Shimmer sweep */}
              <motion.div
                animate={{ x: ["-150%", "250%"] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
                className="absolute inset-y-0 w-1/4 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.12), transparent)",
                }}
              />

              {/* Pulsing dot */}
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
              </span>

              {/* NEW pill */}
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shrink-0"
                style={{
                  background: "linear-gradient(135deg, #ea580c, #f97316)",
                  boxShadow: "0 1px 4px rgba(234,88,12,0.3)",
                }}
              >
                <Sparkles size={8} />
                New Course
              </span>

              {/* Title */}
              <span className="text-sm sm:text-[15px] font-bold text-slate-800 tracking-tight whitespace-nowrap">
                Digital Marketing with AI Launched
              </span>

              {/* Separator */}
              <span className="hidden sm:block w-px h-4 bg-orange-300/60 shrink-0" />

              {/* CTA */}
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-orange-600 group-hover:text-orange-700 transition-colors shrink-0"
              >
                Explore Syllabus
                <ArrowRight size={12} strokeWidth={2.5} />
              </motion.span>

              {/* Mobile arrow only */}
              <ArrowRight size={14} strokeWidth={2.5} className="sm:hidden text-orange-500 shrink-0" />
            </Link>
          </motion.div>


          <motion.div variants={itemVariants} className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-300/70 text-orange-700 text-xs sm:text-sm font-extrabold shadow-sm">
              <Sparkles size={14} className="text-orange-500 animate-pulse" />
              <span>Emerging Edge School of Technology</span>
            </div>
          </motion.div>

          {/* Animated Headline with Crystal Clear High Contrast */}
          <motion.h1
            variants={itemVariants}
            id="hero-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-5 text-balance"
          >
            <span className="text-slate-900 block font-black">Learn Skills Online.</span>
            <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent drop-shadow-sm font-black block mt-1">
              Course is FREE.
            </span>
          </motion.h1>

          {/* Animated Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto mb-6 leading-relaxed font-semibold"
          >
            Web, App, AI, Video Editing, Digital Marketing, Graphics &amp; UI/UX
            courses. All courses include live interactive classes, assignments, and portal access.
          </motion.p>

          {/* Pricing Highlight Pill - Prominent Main Page Pricing */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 backdrop-blur-xs text-slate-900 font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/5">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span>Course Tuition: <span className="text-emerald-600 font-black uppercase">100% FREE</span></span>
              <span className="text-slate-300 font-normal">|</span>
              <span><span className="text-orange-600 font-black">Only One-Time Registration: 1000</span></span>
            </div>
          </motion.div>

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
