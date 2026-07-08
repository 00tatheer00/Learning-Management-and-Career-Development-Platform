import { getProgramCategory } from "@/lib/constants/program-categories";
import { cn } from "@/lib/utils";

interface ProgramCategoryBadgeProps {
  programSlug?: string;
  className?: string;
  variant?: "default" | "onDark";
}

export function ProgramCategoryBadge({
  programSlug,
  className,
  variant = "default",
}: ProgramCategoryBadgeProps) {
  if (!programSlug) return null;

  const category = getProgramCategory(programSlug);
  if (!category) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
        variant === "onDark"
          ? "border-[#c9a84c]/35 bg-[#c9a84c]/10 text-[#dbb85a]"
          : category.badgeClass,
        className
      )}
    >
      {category.sidebarLabel}
    </span>
  );
}
