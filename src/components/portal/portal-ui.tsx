"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export const portalPressable = "cursor-pointer select-none";

interface PortalPageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PortalPageHeader({
  title,
  description,
  eyebrow = "Overview",
  className,
  children,
}: PortalPageHeaderProps) {
  return (
    <div className={cn("mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4", className)}>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary/80">{eyebrow}</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-pt tracking-tight mt-1">{title}</h1>
        {description && (
          <p className="text-sm text-pt-muted mt-2 max-w-2xl leading-relaxed">{description}</p>
        )}
      </div>
      {children && <div className="shrink-0 flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function PortalSectionTitle({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 mb-2.5", className)}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-pt-faint">{title}</p>
      {action}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "orange" | "green" | "blue" | "slate" | "rose" | "sky";
  compact?: boolean;
  href?: string;
  icon?: React.ReactNode;
}

const accentStyles = {
  rose: {
    wrap: "portal-tone-rose border-2 border-rose-300/80 hover:border-rose-600 hover:shadow-md transition-all duration-200",
    text: "text-rose-950 dark:text-rose-100 font-black",
    label: "text-rose-900 dark:text-rose-200 font-bold",
    icon: "bg-rose-600 text-white shadow-xs",
  },
  orange: {
    wrap: "portal-tone-amber border-2 border-amber-300/80 hover:border-amber-600 hover:shadow-md transition-all duration-200",
    text: "text-amber-950 dark:text-amber-100 font-black",
    label: "text-amber-900 dark:text-amber-200 font-bold",
    icon: "bg-amber-600 text-white shadow-xs",
  },
  green: {
    wrap: "portal-tone-emerald border-2 border-emerald-300/80 hover:border-emerald-600 hover:shadow-md transition-all duration-200",
    text: "text-emerald-950 dark:text-emerald-100 font-black",
    label: "text-emerald-900 dark:text-emerald-200 font-bold",
    icon: "bg-emerald-600 text-white shadow-xs",
  },
  blue: {
    wrap: "portal-tone-indigo border-2 border-indigo-300/80 hover:border-indigo-600 hover:shadow-md transition-all duration-200",
    text: "text-indigo-950 dark:text-indigo-100 font-black",
    label: "text-indigo-900 dark:text-indigo-200 font-bold",
    icon: "bg-indigo-600 text-white shadow-xs",
  },
  sky: {
    wrap: "portal-tone-sky border-2 border-sky-300/80 hover:border-sky-600 hover:shadow-md transition-all duration-200",
    text: "text-sky-950 dark:text-sky-100 font-black",
    label: "text-sky-900 dark:text-sky-200 font-bold",
    icon: "bg-sky-600 text-white shadow-xs",
  },
  slate: {
    wrap: "portal-tone-slate border-2 border-slate-300/80 hover:border-slate-600 hover:shadow-md transition-all duration-200",
    text: "text-slate-950 dark:text-slate-100 font-black",
    label: "text-slate-800 dark:text-slate-200 font-bold",
    icon: "bg-slate-700 text-white shadow-xs",
  },
};

export function StatCard({
  label,
  value,
  hint,
  accent = "orange",
  compact = false,
  href,
  icon,
}: StatCardProps) {
  const style = accentStyles[accent];

  const inner = (
    <>
      <div className={cn("flex items-start gap-2.5", !icon && "block")}>
        {icon && (
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg",
              compact ? "h-8 w-8" : "h-9 w-9",
              style.icon
            )}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className={cn(compact ? "text-[10px]" : "text-xs", style.label)}>{label}</p>
          <p className={cn("tabular-nums truncate", compact ? "text-xl mt-0.5" : "text-2.5xl mt-0.5", style.text)}>
            {value}
          </p>
        </div>
      </div>
      {hint && (
        <p className={cn("font-bold text-slate-700 dark:text-slate-300", compact ? "text-[10px] mt-1.5" : "text-xs mt-2")}>{hint}</p>
      )}
    </>
  );

  const className = cn("rounded-2xl border block transition-all duration-200", style.wrap, compact ? "p-3" : "p-4");

  if (href) {
    return (
      <Link href={href} className={cn(portalPressable, className, "hover:shadow-pt-md hover:-translate-y-0.5")}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="portal-card rounded-xl border border-dashed border-pt p-8 text-center">
      <p className="text-base font-semibold text-pt mb-1.5">{title}</p>
      <p className="text-sm text-pt-muted mb-5 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  gradient?: string;
  color?: string;
  compact?: boolean;
}

export function QuickActionCard({
  title,
  description,
  href,
  icon,
  gradient = "from-[#141416] to-[#0a0a0b]",
  color,
  compact = false,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        portalPressable,
        "group flex items-center portal-card rounded-2xl transition-all duration-300 hover:border-primary/30 hover:shadow-pt-md hover:-translate-y-1",
        compact ? "gap-3 p-3" : "gap-3.5 p-4"
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
          compact ? "h-9 w-9" : "h-10 w-10",
          color ? color : cn("bg-gradient-to-br", gradient)
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-semibold text-pt group-hover:text-primary transition-colors truncate",
            compact ? "text-xs" : "text-sm"
          )}
        >
          {title}
        </p>
        <p className={cn("text-pt-muted truncate", compact ? "text-[10px] mt-0.5" : "text-[11px] mt-0.5")}>
          {description}
        </p>
      </div>
      <ArrowRight
        size={14}
        weight="bold"
        className="shrink-0 text-pt-faint opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
      />
    </Link>
  );
}

export function PortalSurfaceCard({
  children,
  className,
  href,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}) {
  const base = cn(
    "portal-card rounded-2xl",
    (href || onClick) && portalPressable,
    className
  );

  if (href) {
    return (
      <Link href={href} className={cn(base, "block hover:border-primary/25 hover:shadow-pt-md")}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(base, "text-left w-full hover:shadow-pt-md")}>
        {children}
      </button>
    );
  }

  return <div className={base}>{children}</div>;
}
