"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  label?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHero({ label, title, description, action }: PageHeroProps) {
  return (
    <section className={cn(
      "relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden",
      action && "pb-10 lg:pb-14"
    )}>
      <div className="absolute inset-0 grid-pattern" aria-hidden="true" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]"
        aria-hidden="true"
      />
      <div className="container-custom relative px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {label && (
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary mb-4">
              {label}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight mb-4 text-balance">
            {title}
          </h1>
          {description && (
            <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl mx-auto">
              {description}
            </p>
          )}
          {action && <div className="mt-6 flex justify-center">{action}</div>}
        </motion.div>
      </div>
    </section>
  );
}
