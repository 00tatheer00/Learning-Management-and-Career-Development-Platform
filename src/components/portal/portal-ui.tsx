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
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-pt-faint">{eyebrow}</p>
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
    wrap: "portal-stat-accent-rose border",
    text: "portal-stat-text-rose",
    icon: "bg-rose-500 text-white",
  },
  orange: {
    wrap: "portal-stat-accent-orange border",
    text: "portal-stat-text-orange",
    icon: "bg-[#c9a84c] text-[#0b1b33]",
  },
  green: {
    wrap: "portal-stat-accent-green border",
    text: "portal-stat-text-green",
    icon: "bg-[#1f6b45] text-white",
  },
  blue: {
    wrap: "portal-stat-accent-blue border",
    text: "portal-stat-text-blue",
    icon: "bg-[#1a365d] text-white",
  },
  sky: {
    wrap: "portal-stat-accent-sky border",
    text: "portal-stat-text-sky",
    icon: "bg-[#3b5b91] text-white",
  },
  slate: {
    wrap: "portal-stat-accent-slate border",
    text: "portal-stat-text-slate",
    icon: "bg-slate-700 text-white",
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
          <p className={cn("font-medium text-pt-muted", compact ? "text-[10px]" : "text-xs")}>{label}</p>
          <p className={cn("font-bold tabular-nums truncate", compact ? "text-xl mt-0.5" : "text-2xl mt-0.5", style.text)}>
            {value}
          </p>
        </div>
      </div>
      {hint && (
        <p className={cn("text-pt-muted", compact ? "text-[10px] mt-1.5" : "text-xs mt-2")}>{hint}</p>
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
  gradient = "from-[#1a365d] to-[#0b1b33]",
  color,
  compact = false,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        portalPressable,
        "group flex items-center portal-card rounded-2xl transition-all duration-250 hover:border-primary/30 hover:shadow-pt-md hover:-translate-y-0.5",
        compact ? "gap-3 p-3" : "gap-3.5 p-4"
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
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
