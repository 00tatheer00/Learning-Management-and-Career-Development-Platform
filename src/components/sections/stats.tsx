"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, Briefcase, Award, ShieldCheck, CheckCircle2 } from "lucide-react";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { stats } from "@/lib/data/stats";

const statIcons = [
  { icon: Users, color: "text-orange-600", bg: "bg-orange-50 border-orange-200/60" },
  { icon: BookOpen, color: "text-sky-600", bg: "bg-sky-50 border-sky-200/60" },
  { icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200/60" },
  { icon: Award, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200/60" },
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
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export function StatsSection() {
  return (
    <section
      className="relative py-16 sm:py-20 lg:py-24 bg-white border-y border-slate-200/80 text-slate-900 overflow-hidden"
      aria-label="Platform Statistics"
    >
      <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8">
        {/* 4 Clean White Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12"
        >
          {stats.map((stat, index) => {
            const meta = statIcons[index % statIcons.length];
            const IconComponent = meta.icon;
            const sublabel = statSublabels[index % statSublabels.length];

            return (
              <motion.div
                key={stat.label}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-300 flex flex-col items-center justify-center text-center"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-xl border ${meta.bg} ${meta.color} shadow-xs flex items-center justify-center`}>
                      <IconComponent size={22} />
                    </div>
                  </div>

                  <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-1 text-center">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1 text-center">
                    {stat.label}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed text-center max-w-[200px]">
                    {sublabel}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Clean Simple Minimal Trust Bar (Center Center) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-center justify-center text-center gap-6 sm:gap-10 pt-8 border-t border-slate-100 text-xs sm:text-sm font-semibold text-slate-600 w-full"
        >
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>100% Practical Learning</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 size={16} className="text-sky-600 shrink-0" />
            <span>Live Class Mentorship</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Award size={16} className="text-orange-600 shrink-0" />
            <span>Verified Skill Certificates</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
