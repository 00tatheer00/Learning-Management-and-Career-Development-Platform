"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Code2, Cpu, Palette, Rocket, Brain, Star, Zap } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { REGISTRATION_OPEN } from "@/lib/constants";
import { HeroParticleCanvas } from "@/components/ui/hero-particle-canvas";

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
          {/* ═══ AI COURSE LAUNCH BANNER ═══ */}
          <motion.div
            variants={itemVariants}
            className="mb-7 relative"
          >
            {/* Outer glow ring — animated */}
            <motion.div
              animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.03, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-[3px] rounded-2xl pointer-events-none"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7, #ec4899, #f97316, #6366f1)",
                filter: "blur(6px)",
                zIndex: 0,
              }}
            />

            {/* Banner card */}
            <Link
              href="/programs"
              className="relative z-10 group inline-flex items-center gap-0 overflow-hidden rounded-2xl cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #faf5ff 0%, #f5f3ff 40%, #eff6ff 80%, #fdf4ff 100%)",
                border: "1.5px solid rgba(139,92,246,0.25)",
                boxShadow: "0 8px 32px rgba(139,92,246,0.15), 0 2px 8px rgba(139,92,246,0.1)",
              }}
            >
              {/* Left accent stripe */}
              <div
                className="shrink-0 h-full flex items-center justify-center px-4 py-3.5"
                style={{
                  background: "linear-gradient(180deg, #7c3aed 0%, #9333ea 50%, #a855f7 100%)",
                  borderRight: "1px solid rgba(139,92,246,0.2)",
                  minHeight: "52px",
                }}
              >
                {/* Animated brain icon */}
                <motion.div
                  animate={{ rotate: [0, -8, 8, -4, 4, 0], scale: [1, 1.12, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <Brain size={22} className="text-white" fill="rgba(255,255,255,0.2)" />
                </motion.div>
              </div>

              {/* Center content */}
              <div className="flex items-center gap-3 px-4 py-3 relative overflow-hidden">
                {/* Shimmer sweep animation */}
                <motion.div
                  animate={{ x: ["-120%", "220%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
                  className="absolute inset-y-0 w-1/3 pointer-events-none"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.12), transparent)",
                    zIndex: 1,
                  }}
                />

                <div className="flex flex-col items-start gap-0.5">
                  {/* NEW badge + label */}
                  <div className="flex items-center gap-2">
                    <motion.span
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white"
                      style={{
                        background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                        boxShadow: "0 2px 8px rgba(124,58,237,0.4)",
                      }}
                    >
                      <Zap size={8} fill="white" strokeWidth={0} />
                      Just Launched
                    </motion.span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500">
                      New Course
                    </span>
                  </div>

                  {/* Main title */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm sm:text-base font-black tracking-tight"
                      style={{
                        background: "linear-gradient(135deg, #4c1d95, #7c3aed, #9333ea)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Artificial Intelligence Course
                    </span>
                    {/* Animated stars */}
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="shrink-0"
                    >
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                    </motion.div>
                  </div>
                </div>

                {/* Floating mini spark particles */}
                <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
                  {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                    <motion.span
                      key={i}
                      animate={{
                        scale: [0, 1.2, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeOut",
                      }}
                      className="absolute w-1.5 h-1.5 rounded-full"
                      style={{
                        background: i % 2 === 0 ? "#a855f7" : "#f97316",
                        top: `${50 + 38 * Math.sin((deg * Math.PI) / 180)}%`,
                        left: `${50 + 38 * Math.cos((deg * Math.PI) / 180)}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  ))}
                  <Brain size={16} className="text-violet-600 relative z-10" />
                </div>

                {/* Right arrow CTA */}
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-violet-600 group-hover:text-violet-800 transition-colors"
                >
                  <span className="hidden sm:inline">Explore</span>
                  <ArrowRight size={13} strokeWidth={2.5} />
                </motion.div>
              </div>
            </Link>
          </motion.div>

          {/* Sleek Top Pill Badge */}

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
            className="text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto mb-8 leading-relaxed font-semibold"
          >
            Web, App, AI, Video Editing, Digital Marketing, Graphics &amp; UI/UX
            courses. Pay module registration fee to join live interactive classes, assignments, and portal access.
          </motion.p>

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
