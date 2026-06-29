"use client";

import { motion } from "framer-motion";

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  label,
  title,
  description,
  align = "center",
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={`mb-12 lg:mb-16 ${align === "center" ? "text-center mx-auto max-w-3xl" : "max-w-2xl"}`}
    >
      {label && (
        <span className="inline-block text-sm font-semibold uppercase tracking-widest text-primary mb-4">
          {label}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight mb-4 text-balance">
        {title}
      </h2>
      {description && (
        <p className="text-base sm:text-lg text-muted leading-relaxed">{description}</p>
      )}
    </motion.div>
  );
}
