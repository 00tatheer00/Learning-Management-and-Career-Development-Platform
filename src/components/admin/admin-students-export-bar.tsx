"use client";

import { DownloadSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";

function exportHref(program: string, activeOnly = false) {
  const params = new URLSearchParams();
  if (program !== "all") params.set("program", program);
  if (activeOnly) params.set("active", "1");
  const query = params.toString();
  return `/api/admin/students/export${query ? `?${query}` : ""}`;
}

export function AdminStudentsExportBar({
  counts,
}: {
  counts: Record<string, number>;
}) {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <div className="mb-6 rounded-xl border border-pt portal-card p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-pt">Download student lists (CSV)</p>
          <p className="text-xs text-pt-muted mt-1 max-w-xl">
            Download separate Web and App student CSV files for WhatsApp groups. Each file includes{" "}
            <strong>Name</strong>, <strong>WhatsApp</strong>, email, and course details. Viewers can
            download exports too.
          </p>
        </div>
        <Button asChild variant="secondary" size="sm" className="shrink-0 gap-2">
          <a href={exportHref("all")} download>
            <DownloadSimple size={16} weight="duotone" />
            All ({total})
          </a>
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ENROLLABLE_PROGRAM_SLUGS.map((slug) => {
          const category = getProgramCategory(slug);
          const label = category?.title ?? slug;
          const count = counts[slug] ?? 0;
          const isWeb = slug === "web-development";

          return (
            <a
              key={slug}
              href={exportHref(slug)}
              download
              className="flex items-center justify-between gap-3 rounded-xl border border-pt-subtle bg-pt-muted/40 px-4 py-3.5 transition-colors hover:border-primary/30 hover:bg-pt-muted"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  {isWeb ? "Web group" : "App group"}
                </p>
                <p className="font-semibold text-sm text-pt truncate">{label}</p>
                <p className="text-xs text-pt-muted mt-0.5">{count} students · CSV download</p>
              </div>
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <DownloadSimple size={18} weight="duotone" />
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
