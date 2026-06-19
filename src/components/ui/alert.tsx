import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Info,
  Warning,
  XCircle,
  type Icon,
} from "@phosphor-icons/react";

const variants = {
  success: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: CheckCircle,
  },
  error: {
    className: "border-red-200 bg-red-50 text-red-900",
    icon: XCircle,
  },
  warning: {
    className: "border-amber-200 bg-amber-50 text-amber-900",
    icon: Warning,
  },
  info: {
    className: "border-blue-200 bg-blue-50 text-blue-900",
    icon: Info,
  },
} as const;

interface AlertProps {
  variant?: keyof typeof variants;
  title?: string;
  children: React.ReactNode;
  className?: string;
  icon?: Icon;
}

export function Alert({
  variant = "info",
  title,
  children,
  className,
  icon,
}: AlertProps) {
  const config = variants[variant];
  const IconComponent = icon ?? config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-xl border p-4 text-sm leading-relaxed",
        config.className,
        className
      )}
    >
      <IconComponent size={20} weight="duotone" className="mt-0.5 shrink-0" />
      <div>
        {title && <p className="mb-1 font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
