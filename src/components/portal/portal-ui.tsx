import { cn } from "@/lib/utils";

interface PortalPageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PortalPageHeader({
  title,
  description,
  className,
  children,
}: PortalPageHeaderProps) {
  return (
    <div className={cn("mb-6 sm:mb-8", className)}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="mt-1.5 text-base text-muted max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "orange" | "green" | "blue" | "slate";
  compact?: boolean;
}

const accentStyles = {
  orange: "border-orange-200 bg-orange-50 text-orange-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};

export function StatCard({ label, value, hint, accent = "orange", compact = false }: StatCardProps) {
  return (
    <div
      className={cn(
        accentStyles[accent],
        compact ? "rounded-xl border p-2.5" : "rounded-2xl border-2 p-5 sm:p-6"
      )}
    >
      <p className={cn("font-medium opacity-80", compact ? "text-[10px] leading-tight" : "text-sm")}>
        {label}
      </p>
      <p className={cn("font-bold", compact ? "text-xl mt-0.5" : "text-3xl sm:text-4xl mt-1")}>
        {value}
      </p>
      {hint && (
        <p className={cn("opacity-70", compact ? "text-[9px] mt-1 line-clamp-2" : "text-xs mt-2")}>
          {hint}
        </p>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-background p-10 text-center">
      <p className="text-lg font-semibold text-foreground mb-2">{title}</p>
      <p className="text-muted mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color?: string;
  compact?: boolean;
}

export function QuickActionCard({
  title,
  description,
  href,
  icon,
  color = "bg-primary/10 text-primary",
  compact = false,
}: QuickActionCardProps) {
  return (
    <a
      href={href}
      className={cn(
        "group flex items-center border border-border bg-background hover:border-primary/30 hover:shadow-sm transition-all",
        compact ? "gap-2.5 rounded-xl p-2.5" : "items-start gap-4 rounded-2xl p-5 hover:shadow-md"
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg",
          compact ? "h-8 w-8" : "h-12 w-12 rounded-xl",
          color
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "font-semibold text-foreground group-hover:text-primary transition-colors",
            compact ? "text-xs" : ""
          )}
        >
          {title}
        </p>
        <p className={cn("text-muted", compact ? "text-[10px] mt-0.5 line-clamp-1" : "text-sm mt-0.5")}>
          {description}
        </p>
      </div>
    </a>
  );
}
