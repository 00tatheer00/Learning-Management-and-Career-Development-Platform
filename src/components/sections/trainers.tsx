"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrainerCard } from "@/components/shared/trainer-card";
import { trainers } from "@/lib/data/trainers";
import { UsersThree, GraduationCap, Briefcase } from "@phosphor-icons/react";

export function TrainersSection() {
  // Get only featured trainers to render on the homepage as shown in the design
  const displayTrainers = trainers.slice(0, 4);

  return (
    <section className="section-padding bg-background/50" aria-labelledby="trainers-heading">
      <div className="container-custom">
        {/* Custom Centered Header Layout */}
        <div className="text-center mx-auto max-w-3xl mb-12 lg:mb-16 flex flex-col items-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A26] mb-4">
            OUR EXPERTS
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-slate-900 dark:text-white mb-4">
            Meet Our <span className="text-[#FF5A26]">Trainers</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
            Experienced professionals dedicated to delivering industry-focused training and real-world skills.
          </p>
          {/* Centered line indicator */}
          <div className="h-[2px] w-12 bg-[#FF5A26] mt-5" />
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
              <TrainerCard trainer={trainer} />
            </motion.div>
          ))}
        </div>

        {/* Bottom Light-Themed Stats Banner */}
        <div className="mt-16 bg-white dark:bg-slate-950 rounded-[2.5rem] p-8 lg:p-10 border border-slate-100 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-900 relative z-10">
            {/* Stat 1 */}
            <div className="flex items-center justify-start md:justify-center gap-4 md:px-6">
              <div className="w-14 h-14 rounded-full border border-[#FF5A26]/20 bg-[#FF5A26]/5 flex items-center justify-center text-[#FF5A26] shrink-0 shadow-sm">
                <UsersThree size={24} weight="bold" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">10+</div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-semibold">Expert Trainers</div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center justify-start md:justify-center gap-4 md:px-6 pt-6 md:pt-0">
              <div className="w-14 h-14 rounded-full border border-[#FF5A26]/20 bg-[#FF5A26]/5 flex items-center justify-center text-[#FF5A26] shrink-0 shadow-sm">
                <GraduationCap size={24} weight="bold" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">1000+</div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-semibold">Students Trained</div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center justify-start md:justify-center gap-4 md:px-6 pt-6 md:pt-0">
              <div className="w-14 h-14 rounded-full border border-[#FF5A26]/20 bg-[#FF5A26]/5 flex items-center justify-center text-[#FF5A26] shrink-0 shadow-sm">
                <Briefcase size={24} weight="bold" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">Real World</div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-semibold">Industry Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
