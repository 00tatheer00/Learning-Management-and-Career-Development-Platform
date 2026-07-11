"use client";

import { useCallback, useEffect, useState } from "react";
import { FilmStrip, ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { StudentRecordingsContent } from "@/components/portal/student-recordings-content";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";
import type { AdminProgramRecordings } from "@/lib/api/admin-recordings";

export function AdminRecordingsPanel() {
  const [programs, setPrograms] = useState<AdminProgramRecordings[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState<string>("web-development");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/recordings", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Could not load recordings");
        return;
      }
      const data = (json.data as AdminProgramRecordings[] | undefined) ?? [];
      setPrograms(data);
      if (data.length > 0 && !data.some((item) => item.programSlug === activeSlug)) {
        setActiveSlug(data[0].programSlug);
      }
    } catch {
      toast.error("Could not load recordings");
    } finally {
      setLoading(false);
    }
  }, [activeSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeProgram = programs.find((item) => item.programSlug === activeSlug) ?? programs[0];

  return (
    <div>
      <PortalPageHeader
        eyebrow="Admin Portal"
        title="Class Recordings"
        description="Watch uploaded class recordings for Web Development and App Development."
      >
        <Button variant="secondary" size="lg" onClick={() => void load()} disabled={loading}>
          <ArrowClockwise size={18} />
          Refresh
        </Button>
      </PortalPageHeader>

      {loading ? (
        <div className="space-y-4">
          <div className="h-11 w-full max-w-md rounded-xl bg-surface/70 animate-pulse" />
          <div className="h-64 rounded-2xl border border-pt bg-surface/60 animate-pulse" />
        </div>
      ) : programs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-pt p-8 text-center">
          <FilmStrip size={32} className="mx-auto text-muted" />
          <p className="mt-3 font-semibold text-pt">No course recordings found</p>
          <p className="text-sm text-pt-muted mt-1">
            Trainers upload links from their portal after each class.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-none pb-0.5 -mx-1 px-1">
            {programs.map((program) => (
              <button
                key={program.programSlug}
                type="button"
                onClick={() => setActiveSlug(program.programSlug)}
                className={cn(
                  "rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors shrink-0 whitespace-nowrap",
                  activeSlug === program.programSlug
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-pt bg-background text-pt hover:bg-surface"
                )}
              >
                {program.courseTitle}
                <span className="ml-2 text-xs opacity-80">
                  ({program.recordings.length})
                </span>
              </button>
            ))}
          </div>

          {activeProgram && (
            <StudentRecordingsContent
              programSlug={activeProgram.programSlug}
              recordings={activeProgram.recordings}
              adminView
            />
          )}
        </>
      )}
    </div>
  );
}
