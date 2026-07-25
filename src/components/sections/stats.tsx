"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, Briefcase, Award, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { stats } from "@/lib/data/stats";

const statIcons = [
  { icon: Users, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-200/50", glow: "shadow-orange-500/10" },
  { icon: BookOpen, color: "text-sky-500", bg: "bg-sky-500/10 border-sky-200/50", glow: "shadow-sky-500/10" },
  { icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-200/50", glow: "shadow-emerald-500/10" },
  { icon: Award, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-200/50", glow: "shadow-purple-500/10" },
];

const statSublabels = [
  "Active learners across Pakistan",
  "Web, App, AI, UI/UX & Marketing",
  "Production-ready portfolio builds",
  "Senior software engineers & experts",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function StatsSection() {
  return (
    <section
      className="relative py-20 sm:py-24 lg:py-28 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white"
      aria-label="Enterprise Statistics & Trust"
    >
      {/* Background Ambient Glow & Grid Lines */}
      <div className="absolute inset-0 hero-grid-wrap pointer-events-none opacity-20" aria-hidden="true">
        <div className="absolute inset-0 hero-grid-lines" />
      </div>

      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8">
        {/* Enterprise Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Zap size={13} className="text-orange-400 fill-orange-400 animate-pulse" />
            <span>ENTERPRISE IMPACT METRICS</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-4">
            Empowering the Next Generation of Tech Leaders
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium">
            Real-world skill development backed by live industry mentorship, assignments, and production-ready portfolio projects.
          </p>
        </motion.div>

        {/* 4 Glassmorphic Bento Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16"
        >
          {stats.map((stat, index) => {
            const meta = statIcons[index % statIcons.length];
            const IconComponent = meta.icon;
            const sublabel = statSublabels[index % statSublabels.length];

            return (
              <motion.div
                key={stat.label}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative overflow-hidden rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 sm:p-7 shadow-xl hover:border-slate-700 transition-all duration-300 group"
              >
                {/* Top Glowing Gradient Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-sky-500 opacity-60 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center justify-between mb-5">
                  <div className={`p-3 rounded-xl border ${meta.bg} ${meta.color} shadow-md`}>
                    <IconComponent size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-800/80 px-2.5 py-1 rounded-md">
                    VERIFIED
                  </span>
                </div>

                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1 flex items-baseline gap-0.5">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </div>

                <h3 className="text-base font-bold text-slate-200 mb-1.5 group-hover:text-orange-400 transition-colors">
                  {stat.label}
                </h3>

                <p className="text-xs text-slate-400 leading-snug font-medium">
                  {sublabel}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Enterprise Trust Indicators Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 border-t border-slate-800/80 text-xs font-bold text-slate-300"
        >
          <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-2 rounded-full border border-slate-800">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>100% Practical Project-Based Learning</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-2 rounded-full border border-slate-800">
            <CheckCircle2 size={16} className="text-sky-400" />
            <span>Live Interactive Mentorship &amp; Feedback</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/60 px-4 py-2 rounded-full border border-slate-800">
            <Award size={16} className="text-amber-400" />
            <span>Verified Skill Share Certificates</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
