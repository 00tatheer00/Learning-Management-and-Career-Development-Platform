"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TrainerCard } from "@/components/shared/trainer-card";
import { trainers } from "@/lib/data/trainers";
import { UsersThree, GraduationCap, Briefcase } from "@phosphor-icons/react";

export function TrainersSection() {
  // Get only featured trainers to render on the homepage as shown in the design
  const displayTrainers = trainers.slice(0, 4);

  return (
    <section className="section-padding bg-background/50" aria-labelledby="trainers-heading">
      <div className="container-custom">
        {/* Custom Header Layout */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 lg:mb-16">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A26]">
                OUR EXPERTS
              </span>
              <div className="flex-1 max-w-[120px] h-[1px] bg-[#FF5A26]/30 relative hidden sm:block">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#FF5A26]" />
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-slate-900 dark:text-white">
              Meet Our<br />
              <span className="text-[#FF5A26]">Trainers</span>
            </h2>
          </div>

          <div className="lg:max-w-md xl:max-w-lg text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed lg:pb-2">
            We are a team of passionate developers and mentors dedicated to delivering practical, real-world training and empowering the next generation of tech professionals.
          </div>

          <div className="flex flex-col items-center gap-2 lg:pb-2 self-start lg:self-end">
            <Link 
              href="/trainers" 
              className="flex items-center justify-center w-14 h-14 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm text-foreground hover:bg-[#FF5A26] hover:text-white hover:border-[#FF5A26] hover:scale-105 transition-all duration-300 group"
              aria-label="View all trainers"
            >
              <ArrowRight className="w-6 h-6 text-[#FF5A26] group-hover:text-white transition-colors" />
            </Link>
            <span className="text-[9px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
              VIEW ALL
            </span>
          </div>
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayTrainers.map((trainer, index) => (
            <motion.div
              key={trainer.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <TrainerCard trainer={trainer} index={index} />
            </motion.div>
          ))}
        </div>

        {/* Bottom Dark Stats Banner */}
        <div className="mt-16 bg-[#0B1220] rounded-[2rem] p-8 lg:p-10 border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Subtle glow highlight */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,87,38,0.03),transparent)] pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10 relative z-10">
            {/* Stat 1 */}
            <div className="flex items-center justify-start md:justify-center gap-4 md:px-6">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FF5A26] shrink-0 shadow-lg">
                <UsersThree size={24} weight="duotone" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white leading-none">10+</div>
                <div className="text-xs text-slate-400 mt-1.5 font-medium">Expert Trainers</div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center justify-start md:justify-center gap-4 md:px-6 pt-6 md:pt-0">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FF5A26] shrink-0 shadow-lg">
                <GraduationCap size={24} weight="duotone" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white leading-none">1000+</div>
                <div className="text-xs text-slate-400 mt-1.5 font-medium">Students Trained</div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center justify-start md:justify-center gap-4 md:px-6 pt-6 md:pt-0">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FF5A26] shrink-0 shadow-lg">
                <Briefcase size={24} weight="duotone" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white leading-none">Real World</div>
                <div className="text-xs text-slate-400 mt-1.5 font-medium">Industry Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
