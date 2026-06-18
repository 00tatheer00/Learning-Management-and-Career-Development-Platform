import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "future";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
        {
          "bg-primary/10 text-primary border border-primary/20":
            variant === "default",
          "bg-secondary text-foreground border border-border":
            variant === "secondary",
          "border border-border text-muted bg-background": variant === "outline",
          "bg-amber-50 text-amber-700 border border-amber-200":
            variant === "future",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
