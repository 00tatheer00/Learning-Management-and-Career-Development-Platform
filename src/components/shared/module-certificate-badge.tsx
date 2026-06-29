"use client";

import { Certificate } from "@phosphor-icons/react";
import { MODULE_CERTIFICATE_SHORT } from "@/lib/constants/program-marketing";
import { cn } from "@/lib/utils";

export function ModuleCertificateBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800",
        className
      )}
    >
      <Certificate size={14} weight="duotone" aria-hidden="true" />
      {MODULE_CERTIFICATE_SHORT}
    </span>
  );
}
