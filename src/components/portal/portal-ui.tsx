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
    <div className={cn("mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3", className)}>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">{eyebrow}</p>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight mt-0.5">{title}</h1>
        {description && (
          <p className="text-xs text-zinc-500 mt-1 max-w-2xl leading-relaxed">{description}</p>
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
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{title}</p>
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
  rose: { wrap: "bg-rose-50 border-rose-100", text: "text-rose-800", icon: "bg-rose-500 text-white" },
  orange: { wrap: "bg-amber-50 border-amber-100", text: "text-amber-800", icon: "bg-amber-500 text-white" },
  green: { wrap: "bg-emerald-50 border-emerald-100", text: "text-emerald-800", icon: "bg-emerald-500 text-white" },
  blue: { wrap: "bg-blue-50 border-blue-100", text: "text-blue-800", icon: "bg-blue-500 text-white" },
  sky: { wrap: "bg-sky-50 border-sky-100", text: "text-sky-800", icon: "bg-sky-500 text-white" },
  slate: { wrap: "bg-zinc-50 border-zinc-100", text: "text-zinc-800", icon: "bg-zinc-500 text-white" },
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
          <p className={cn("font-medium text-zinc-500", compact ? "text-[10px]" : "text-xs")}>{label}</p>
          <p className={cn("font-bold tabular-nums", compact ? "text-xl mt-0.5" : "text-2xl mt-0.5", style.text)}>
            {value}
          </p>
        </div>
      </div>
      {hint && (
        <p className={cn("text-zinc-500", compact ? "text-[10px] mt-1.5" : "text-xs mt-2")}>{hint}</p>
      )}
    </>
  );

  const className = cn(
    "rounded-xl border block",
    style.wrap,
    compact ? "p-2.5" : "p-4"
  );

  if (href) {
    return (
      <Link href={href} className={cn(portalPressable, className, "hover:shadow-sm")}>
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
    <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-8 text-center shadow-sm">
      <p className="text-base font-semibold text-zinc-900 mb-1.5">{title}</p>
      <p className="text-sm text-zinc-500 mb-5 max-w-md mx-auto">{description}</p>
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
  gradient = "from-orange-500 to-amber-500",
  color,
  compact = false,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        portalPressable,
        "group flex items-center rounded-xl border border-zinc-200/80 bg-white shadow-sm hover:border-orange-200/60 hover:shadow-md",
        compact ? "gap-2.5 p-2.5" : "gap-3 p-3.5"
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
            "font-semibold text-zinc-900 group-hover:text-primary transition-colors truncate",
            compact ? "text-xs" : "text-sm"
          )}
        >
          {title}
        </p>
        <p className={cn("text-zinc-500 truncate", compact ? "text-[10px] mt-0.5" : "text-[11px] mt-0.5")}>
          {description}
        </p>
      </div>
      <ArrowRight
        size={14}
        weight="bold"
        className="shrink-0 text-zinc-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
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
    "rounded-xl border border-zinc-200/80 bg-white shadow-sm",
    (href || onClick) && portalPressable,
    className
  );

  if (href) {
    return (
      <Link href={href} className={cn(base, "block hover:border-orange-200/60 hover:shadow-md")}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(base, "text-left w-full hover:shadow-md")}>
        {children}
      </button>
    );
  }

  return <div className={base}>{children}</div>;
}
