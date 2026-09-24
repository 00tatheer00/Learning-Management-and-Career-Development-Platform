"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Code2, Cpu, Palette, Megaphone, ShoppingCart, Smartphone, CheckCircle2, Users, Video } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { REGISTRATION_OPEN } from "@/lib/constants";
import { trackTikTokClickButton } from "@/lib/analytics/tiktok";

const HeroParticleCanvas = dynamic(
  () => import("@/components/ui/hero-particle-canvas").then((m) => m.HeroParticleCanvas),
  { ssr: false }
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1] },
  },
};

const PROGRAMS = [
  { name: "Web Development", icon: Code2, color: "orange", href: "/programs/web-development", isNew: false },
  { name: "App Development", icon: Smartphone, color: "sky", href: "/programs/app-development", isNew: false },
  { name: "AI & Automation", icon: Cpu, color: "violet", href: "/programs/artificial-intelligence", isNew: false },
  { name: "Digital Marketing", icon: Megaphone, color: "emerald", href: "/programs/digital-marketing", isNew: true },
  { name: "Graphics Design", icon: Palette, color: "rose", href: "/programs/graphics-designing", isNew: true },
  { name: "Ecommerce", icon: ShoppingCart, color: "amber", href: "/programs/ecommerce", isNew: true },
] as const;

const STATS = [
  { icon: Users, label: "Live Classes", value: "Weekly" },
  { icon: CheckCircle2, label: "Course Fee", value: "FREE" },
  { icon: Video, label: "Recordings", value: "Included" },
] as const;

const colorMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200/60", dot: "bg-orange-500" },
  sky: { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-200/60", dot: "bg-sky-500" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200/60", dot: "bg-violet-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200/60", dot: "bg-emerald-500" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200/60", dot: "bg-rose-500" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200/60", dot: "bg-amber-500" },
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
      className="hero-section relative flex flex-col justify-center overflow-x-clip pt-24 pb-16 lg:pt-28 lg:pb-20 bg-gradient-to-b from-white via-orange-50/30 to-white"
      aria-labelledby="hero-heading"
    >
      {/* Interactive Lightweight Canvas Background */}
      <HeroParticleCanvas />

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 hero-grid-wrap pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 hero-grid-lines opacity-30" />
        <div className="absolute inset-0 hero-grid-shimmer" />
      </div>

      {/* Soft ambient glow */}
      <div
        className="hero-glow absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-orange-500/8 via-amber-400/10 to-sky-400/6 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="container-custom relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-3xl flex flex-col items-center"
        >
          {/* School Badge */}
          <motion.div variants={itemVariants} className="mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/8 border border-orange-200/50 text-xs font-bold text-orange-700 tracking-wide">
              <Sparkles size={12} className="text-orange-500" />
              Emerging Edge School of Technology
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            id="hero-heading"
            className="text-3xl sm:text-4xl md:text-[2.75rem] font-extrabold tracking-tight leading-[1.2] mb-4 text-balance"
          >
            <span className="text-slate-900">Learn In-Demand Skills.</span>
            <br />
            <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              100% Free Tuition.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-6 leading-relaxed"
          >
            Professional bootcamps in Web, App, AI, Digital Marketing, Graphics &amp; Ecommerce
            with live classes, assignments, and portal access.
          </motion.p>

          {/* Compact Stats Row */}
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-6 sm:gap-8 mb-7">
            {STATS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 text-xs sm:text-sm">
                <Icon size={15} className="text-orange-500 shrink-0" />
                <span className="text-slate-500">{label}:</span>
                <span className="font-bold text-slate-900">{value}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto mb-8"
          >
            {REGISTRATION_OPEN ? (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="text-sm h-11 px-7 shadow-lg shadow-orange-500/20 rounded-xl font-bold" asChild>
                  <Link
                    href="/register"
                    prefetch
                    onClick={() =>
                      trackTikTokClickButton({
                        contentId: "hero_register_now",
                        contentName: "Hero Register Now",
                      })
                    }
                  >
                    Register Now
                    <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <Button size="lg" disabled className="text-sm h-11 px-7 opacity-75 cursor-not-allowed rounded-xl font-bold">
                Admissions Closed
              </Button>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" variant="secondary" className="text-sm h-11 px-7 rounded-xl font-bold border border-slate-200" asChild>
                <Link href="/programs" prefetch>Explore Programs</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Registration Fee Pill */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200/80 text-xs sm:text-sm font-semibold text-slate-700">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              One-Time Registration Fee:
              <span className="font-black text-orange-600">PKR 1,000</span>
            </div>
          </motion.div>

          {/* Programs Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-lg"
          >
            {PROGRAMS.map(({ name, icon: Icon, color, href, isNew }) => {
              const c = colorMap[color];
              return (
                <Link
                  key={name}
                  href={href}
                  className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl ${c.bg} border ${c.border} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
                >
                  <Icon size={15} className={`${c.text} shrink-0`} />
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">{name}</span>
                  {isNew && (
                    <span className={`absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider ${c.dot} text-white`}>
                      New
                    </span>
                  )}
                </Link>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
