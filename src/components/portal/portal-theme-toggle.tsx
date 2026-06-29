"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { usePortalTheme } from "@/components/portal/portal-theme-provider";
import { cn } from "@/lib/utils";

export function PortalThemeToggle({ className }: { className?: string }) {
  const { isDark, toggleTheme } = usePortalTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "relative inline-flex h-8 w-[3.25rem] items-center rounded-full border border-pt p-0.5 transition-colors",
        "bg-pt-muted hover:bg-pt-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        className
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-pt-surface shadow-sm transition-transform duration-300 ease-out",
          isDark && "translate-x-[1.35rem]"
        )}
        aria-hidden="true"
      />
      <Sun
        size={14}
        weight="duotone"
        className={cn(
          "relative z-10 ml-1.5 transition-colors",
          !isDark ? "text-amber-500" : "text-pt-faint"
        )}
      />
      <Moon
        size={14}
        weight="duotone"
        className={cn(
          "relative z-10 ml-auto mr-1.5 transition-colors",
          isDark ? "text-indigo-300" : "text-pt-faint"
        )}
      />
    </button>
  );
}
