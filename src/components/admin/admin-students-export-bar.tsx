"use client";

import { DownloadSimple, CaretDown, CaretUp } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { getProgramBySlug } from "@/lib/data/programs";

const PROGRAM_MODULES: Record<string, string[]> = {
  "web-development": ["HTML & CSS", "JavaScript", "React", "Backend + Database"],
  "app-development": ["Dart & OOP", "Flutter Frontend", "Firebase & APIs"],
};

function exportHref(program: string, module?: string, activeOnly = false) {
  const params = new URLSearchParams();
  if (program !== "all") params.set("program", program);
  if (module) params.set("module", module);
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
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  return (
    <div className="mb-6 rounded-xl border border-pt portal-card p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-pt">Download student lists (CSV)</p>
          <p className="text-xs text-pt-muted mt-1 max-w-xl">
            WhatsApp groups ke liye — Web aur App alag files download karein, ya module wise bhi kar sakte hain.
            CSV mein <strong>Name</strong>, <strong>WhatsApp</strong>, email aur course details hain.
            Viewer admin bhi download kar sakti hain.
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
          const modules = PROGRAM_MODULES[slug] ?? [];
          const isExpanded = expandedProgram === slug;

          return (
            <div key={slug} className="rounded-xl border border-pt-subtle bg-pt-muted/40 overflow-hidden">
              {/* Program row */}
              <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                <a
                  href={exportHref(slug)}
                  download
                  className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">
                    {isWeb ? "Web group" : "App group"}
                  </p>
                  <p className="font-semibold text-sm text-pt truncate">{label}</p>
                  <p className="text-xs text-pt-muted mt-0.5">{count} students · CSV download</p>
                </a>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={exportHref(slug)}
                    download
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    title="Download all"
                  >
                    <DownloadSimple size={18} weight="duotone" />
                  </a>
                  <button
                    onClick={() => setExpandedProgram(isExpanded ? null : slug)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-pt-subtle text-pt-muted hover:bg-pt-muted transition-colors"
                    title={isExpanded ? "Hide modules" : "Module wise download"}
                  >
                    {isExpanded ? <CaretUp size={14} /> : <CaretDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Module rows */}
              {isExpanded && (
                <div className="border-t border-pt-subtle divide-y divide-pt-subtle/50">
                  {modules.map((mod) => (
                    <a
                      key={mod}
                      href={exportHref(slug, mod)}
                      download
                      className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-pt-muted transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-pt-muted uppercase tracking-wide">Module</p>
                        <p className="text-sm font-medium text-pt truncate">{mod}</p>
                      </div>
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <DownloadSimple size={14} weight="duotone" />
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
