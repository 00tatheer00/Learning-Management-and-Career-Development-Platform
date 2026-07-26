"use client";

import { motion } from "framer-motion";
import { ExternalLink, Code2, Sparkles, Layers, ArrowUpRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentProject {
  title: string;
  category: string;
  studentName: string;
  studentRole: string;
  program: string;
  description: string;
  tags: string[];
  gradient: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  metrics: string;
}

const projects: StudentProject[] = [
  {
    title: "AI Medical Assistant & Diagnostics Bot",
    category: "Artificial Intelligence",
    studentName: "Hamza Ali",
    studentRole: "Batch 1 Student",
    program: "AI & Automation",
    description: "Intelligent medical query triage system powered by Python, LLM API, and Streamlit with real-time symptom analysis.",
    tags: ["Python", "OpenAI API", "Streamlit", "LangChain"],
    gradient: "from-purple-500/10 via-indigo-500/10 to-violet-500/5",
    borderColor: "border-purple-200 dark:border-purple-900/40",
    badgeBg: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
    badgeText: "AI & Automation",
    metrics: "1,200+ Demo Queries Processed",
  },
  {
    title: "EcoStore — FullStack E-Commerce Platform",
    category: "Web Development",
    studentName: "Ayesha Malik",
    studentRole: "Batch 1 Student",
    program: "Web Development",
    description: "Modern e-commerce platform with product filtering, Stripe payment gateway, cart management, and admin dashboard.",
    tags: ["Next.js", "TypeScript", "TailwindCSS", "Prisma"],
    gradient: "from-orange-500/10 via-amber-500/10 to-orange-500/5",
    borderColor: "border-orange-200 dark:border-orange-900/40",
    badgeBg: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
    badgeText: "Web Development",
    metrics: "100% Practical Build",
  },
  {
    title: "QuickRide — Ride Booking & Delivery App",
    category: "App Development",
    studentName: "Bilal Ahmad",
    studentRole: "Batch 1 Student",
    program: "App Development",
    description: "Cross-platform mobile application for real-time ride tracking, driver dispatching, and digital wallet integration.",
    tags: ["Flutter", "Dart", "Firebase", "Google Maps API"],
    gradient: "from-sky-500/10 via-blue-500/10 to-cyan-500/5",
    borderColor: "border-sky-200 dark:border-sky-900/40",
    badgeBg: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
    badgeText: "App Development",
    metrics: "iOS & Android Ready",
  },
  {
    title: "Nexus — Fintech Dashboard Design System",
    category: "UI/UX Design",
    studentName: "Sana Tariq",
    studentRole: "Batch 1 Student",
    program: "UI/UX Design",
    description: "Comprehensive financial dashboard UI design system featuring 40+ responsive components, dark mode, and interactive prototypes.",
    tags: ["Figma", "UI Design", "Design System", "Prototyping"],
    gradient: "from-emerald-500/10 via-teal-500/10 to-emerald-500/5",
    borderColor: "border-emerald-200 dark:border-emerald-900/40",
    badgeBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    badgeText: "UI/UX Design",
    metrics: "40+ UI Components Built",
  },
];

export function StudentProjectsSection() {
  return (
    <section
      className="relative py-16 sm:py-24 bg-surface/50 overflow-hidden border-b border-border/60"
      aria-labelledby="projects-heading"
    >
      <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-xs font-bold mb-4"
          >
            <Trophy size={14} className="text-orange-500" />
            <span>Student Success Showcase</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            id="projects-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground text-balance"
          >
            Built by EEST Students. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Real-World Capstone Builds.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-muted font-medium leading-relaxed"
          >
            Every student builds industry-grade applications during their program. Here is a glimpse of projects created in live classes.
          </motion.p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className={`rounded-2xl border ${project.borderColor} bg-background p-6 sm:p-7 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative group overflow-hidden`}
            >
              {/* Top ambient gradient */}
              <div
                className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${project.gradient} opacity-70 pointer-events-none`}
              />

              <div>
                {/* Header Badge & Category */}
                <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${project.badgeBg}`}>
                    {project.badgeText}
                  </span>
                  <span className="text-xs font-semibold text-muted flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-500" />
                    {project.metrics}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2.5 relative z-10 leading-snug">
                  {project.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-muted leading-relaxed mb-5 relative z-10">
                  {project.description}
                </p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-surface border border-border/80 text-[11px] font-semibold text-foreground/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Student Footer */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                    {project.studentName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{project.studentName}</p>
                    <p className="text-[11px] text-muted font-medium">{project.studentRole}</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                  <span>View Details</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
