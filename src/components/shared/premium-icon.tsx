"use client";

import { motion } from "framer-motion";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { box: "w-10 h-10 rounded-lg", icon: 20 },
  md: { box: "w-12 h-12 rounded-xl", icon: 24 },
  lg: { box: "w-14 h-14 rounded-xl", icon: 28 },
  xl: { box: "w-16 h-16 rounded-2xl", icon: 32 },
} as const;

interface PremiumIconProps {
  icon: Icon;
  size?: keyof typeof sizeMap;
  active?: boolean;
  interactive?: boolean;
  className?: string;
}

export function PremiumIcon({
  icon: IconComponent,
  size = "md",
  active = false,
  interactive = true,
  className,
}: PremiumIconProps) {
  const { box, icon: iconSize } = sizeMap[size];

  return (
    <motion.div
      whileHover={interactive ? { scale: 1.1, y: -3 } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
      className={cn(
        "relative flex shrink-0 items-center justify-center border transition-[box-shadow,border-color,background] duration-300",
        box,
        active
          ? "border-primary/40 bg-gradient-to-br from-primary/20 via-primary/10 to-orange-50 shadow-lg shadow-primary/20"
          : "border-border bg-gradient-to-br from-white to-surface",
        interactive &&
          !active &&
          "group-hover:border-primary/40 group-hover:bg-gradient-to-br group-hover:from-primary/15 group-hover:to-orange-50 group-hover:shadow-lg group-hover:shadow-primary/15",
        className
      )}
    >
      <IconComponent
        size={iconSize}
        weight="duotone"
        className={cn(
          "relative z-10 transition-all duration-300",
          active
            ? "text-primary"
            : "text-slate-500 group-hover:text-primary group-hover:drop-shadow-sm"
        )}
      />
      {active && (
        <span
          className="absolute inset-0 rounded-[inherit] bg-primary/5"
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}

interface PremiumListIconProps {
  icon: Icon;
  className?: string;
}

export function PremiumListIcon({ icon: IconComponent, className }: PremiumListIconProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20",
        className
      )}
    >
      <IconComponent size={14} weight="duotone" className="text-primary" />
    </span>
  );
}
