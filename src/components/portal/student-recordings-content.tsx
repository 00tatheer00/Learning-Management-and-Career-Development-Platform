"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  PlayCircle,
  Sparkle,
  VideoCamera,
  ArrowSquareOut,
  FilmStrip,
  Copy,
  Check,
  MagnifyingGlass,
  FileText,
  Info,
  X,
} from "@phosphor-icons/react";
import type { ClassRecordingRecord } from "@/lib/api/class-recordings";
import { getClassProgress, type ClassSlot } from "@/lib/class-schedule";
import { getProgramCategory, PREMIUM_HEADER_GRADIENT_FALLBACK } from "@/lib/constants/program-categories";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";
import { Button } from "@/components/ui/button";

interface StudentRecordingsContentProps {
  programSlug: string;
  recordings: ClassRecordingRecord[];
  adminView?: boolean;
  studentModule?: string;
  modules?: string[];
}

function statusStyles(status: ClassSlot["status"]) {
  switch (status) {
    case "done":
      return {
        ring: "ring-emerald-500/30",
        bg: "bg-emerald-500/10",
        text: "text-emerald-700 dark:text-emerald-300",
        dot: "bg-emerald-500",
        label: "Done",
      };
    case "live":
      return {
        ring: "ring-rose-500/40",
        bg: "bg-rose-500/10",
        text: "text-rose-700 dark:text-rose-300",
        dot: "bg-rose-500 animate-pulse",
        label: "Live now",
      };
    case "today":
      return {
        ring: "ring-primary/40",
        bg: "bg-primary/10",
        text: "text-primary",
        dot: "bg-primary",
        label: "Today",
      };
    default:
      return {
        ring: "ring-border",
        bg: "bg-surface/80",
        text: "text-pt-muted",
        dot: "bg-border",
        label: "Upcoming",
      };
  }
}

export function StudentRecordingsContent({
  programSlug,
  recordings = [],
  adminView = false,
  studentModule,
  modules = [],
}: StudentRecordingsContentProps) {
  const safeRecordings = useMemo(
    () => (Array.isArray(recordings) ? recordings.filter(Boolean) : []),
    [recordings]
  );
  const safeModules = useMemo(
    () => (Array.isArray(modules) ? modules.filter(Boolean) : []),
    [modules]
  );

  const progress = useMemo(() => {
    try {
      return getClassProgress(programSlug || "web-development");
    } catch {
      return {
        slots: [],
        config: null,
        completed: [],
        todaySlot: null,
        liveSlot: null,
        upcoming: [],
        nextTwo: [],
        currentClassNumber: 0,
        completedCount: 0,
      };
    }
  }, [programSlug]);

  const category = useMemo(() => {
    try {
      return getProgramCategory(programSlug || "web-development");
    } catch {
      return null;
    }
  }, [programSlug]);

  const [selectedModule, setSelectedModule] = useState<string>(studentModule || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeNotesRecording, setActiveNotesRecording] = useState<ClassRecordingRecord | null>(null);

  // Available unique modules
  const availableModules = useMemo(() => {
    if (safeModules.length > 0) return safeModules;
    const extracted = Array.from(
      new Set(
        safeRecordings
          .map((r) => r.level)
          .filter((l): l is string => Boolean(l && typeof l === "string" && l.trim()))
      )
    );
    return extracted;
  }, [safeModules, safeRecordings]);

  // Filtered recordings
  const filteredRecordings = useMemo(() => {
    const selMod = (selectedModule || "all").trim().toLowerCase();
    const query = searchQuery.trim().toLowerCase();

    return safeRecordings.filter((r) => {
      const recLevel = (r.level || "").trim().toLowerCase();
      const matchModule = selMod === "all" || recLevel === selMod;

      const matchQuery =
        !query ||
        (r.title && r.title.toLowerCase().includes(query)) ||
        (r.classNumber != null && r.classNumber.toString() === query) ||
        (r.notes && r.notes.toLowerCase().includes(query));

      return matchModule && matchQuery;
    });
  }, [safeRecordings, selectedModule, searchQuery]);

  const recordingByClass = useMemo(() => {
    const map = new Map<number, ClassRecordingRecord>();
    for (const r of safeRecordings) {
      if (r.classNumber != null) {
        map.set(r.classNumber, r);
      }
    }
    return map;
  }, [safeRecordings]);

  const recentSlots = useMemo(() => {
    if (!progress?.slots || progress.slots.length === 0) return [];
    const compCount = progress.completedCount || 0;
    return progress.slots.slice(
      Math.max(0, compCount - 1),
      Math.min(progress.slots.length, compCount + 4)
    );
  }, [progress]);

  const handleCopy = (e: React.MouseEvent, rec: ClassRecordingRecord) => {
    e.preventDefault();
    e.stopPropagation();
    if (!rec?.driveUrl) return;
    navigator.clipboard
      .writeText(rec.driveUrl)
      .then(() => {
        setCopiedId(rec.id);
        toast.success("Google Drive link copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8 text-white shadow-xl bg-gradient-to-br",
          category?.headerGradient ?? PREMIUM_HEADER_GRADIENT_FALLBACK
        )}
      >
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-6 bottom-0 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-widest">
            <Sparkle size={14} weight="fill" />
            Class Recordings Archive {studentModule ? `· ${studentModule}` : ""}
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
            {studentModule
              ? `${progress?.config?.programTitle ?? category?.name ?? "Your Classes"} — ${studentModule}`
              : progress?.config?.programTitle ?? category?.name ?? "Your Classes"}
          </h2>
          <p className="mt-2 text-sm text-white/90 max-w-xl">
            Watch recorded live classes, download lecture notes, and review previous session archives.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="rounded-2xl bg-white/15 backdrop-blur px-4 py-3 border border-white/20">
              <p className="text-[10px] uppercase tracking-wider text-white/80">Available Recordings</p>
              <p className="text-2xl font-bold">{safeRecordings.length}</p>
            </div>
            {progress?.slots && progress.slots.length > 0 && (
              <div className="rounded-2xl bg-white/15 backdrop-blur px-4 py-3 border border-white/20">
                <p className="text-[10px] uppercase tracking-wider text-white/80">Completed Classes</p>
                <p className="text-2xl font-bold">{progress.completedCount || 0}</p>
              </div>
            )}
            {progress?.todaySlot && (
              <div className="rounded-2xl bg-white/15 backdrop-blur px-4 py-3 border border-white/20">
                <p className="text-[10px] uppercase tracking-wider text-white/80">Today</p>
                <p className="text-lg font-bold">Class {progress.todaySlot.classNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Card (shown if program is scheduled) */}
      {recentSlots.length > 0 && (
        <div className="portal-card rounded-2xl border border-pt p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <VideoCamera size={20} weight="duotone" className="text-primary" />
            <h3 className="text-lg font-bold text-pt">Your class timeline</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
            {recentSlots.map((slot) => {
              const styles = statusStyles(slot.status);
              const recording = recordingByClass.get(slot.classNumber);
              return (
                <div
                  key={slot.classNumber}
                  className={cn(
                    "min-w-[160px] snap-start rounded-2xl border p-4 ring-1",
                    styles.ring,
                    styles.bg
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-full", styles.dot)} />
                    <span className={cn("text-[10px] font-bold uppercase tracking-wide", styles.text)}>
                      {styles.label}
                    </span>
                  </div>
                  <p className="mt-3 text-base font-bold text-pt">Class {slot.classNumber}</p>
                  <p className="text-xs text-pt-muted mt-1">{slot.weekdayLabel}</p>
                  <p className="text-xs text-pt-muted">{slot.dateLabel}</p>
                  {slot.status === "done" && recording && (
                    <p className="mt-2 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle size={12} weight="fill" />
                      Recording uploaded
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {progress?.todaySlot && (
            <p className="mt-4 text-sm rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-pt-muted">
              <strong className="text-pt">Class {progress.todaySlot.classNumber}</strong> is scheduled
              today ({progress.todaySlot.weekdayLabel}) at{" "}
              <strong className="text-pt">{progress.todaySlot.timeLabel}</strong>.
              {progress.liveSlot
                ? " Class is live right now — join from Live Classes."
                : progress.todaySlot.status === "today"
                  ? " Recording will appear here after class."
                  : " Marked done after class ends."}
            </p>
          )}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-pt flex items-center gap-2">
            <PlayCircle size={22} weight="duotone" className="text-primary" />
            Class Recordings
            <span className="text-xs font-normal text-muted-foreground">
              ({filteredRecordings.length} total)
            </span>
          </h3>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search class or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-pt bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Module Filter Tabs if multiple */}
        {availableModules.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 border-b border-border/60">
            <button
              type="button"
              onClick={() => setSelectedModule("all")}
              className={cn(
                "rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 whitespace-nowrap",
                (selectedModule || "all").toLowerCase() === "all"
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              )}
            >
              All Modules ({safeRecordings.length})
            </button>
            {availableModules.map((mod) => {
              const count = safeRecordings.filter(
                (r) => (r.level ?? "").toLowerCase() === (mod || "").toLowerCase()
              ).length;
              return (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setSelectedModule(mod)}
                  className={cn(
                    "rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 whitespace-nowrap",
                    (selectedModule || "").toLowerCase() === (mod || "").toLowerCase()
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  {mod} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Recordings Grid */}
        {filteredRecordings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-pt p-10 text-center bg-surface/30">
            <PlayCircle size={40} className="mx-auto text-muted-foreground opacity-40 mb-3" />
            <p className="font-semibold text-pt">No class recordings found</p>
            <p className="text-xs text-pt-muted mt-1 max-w-md mx-auto">
              {searchQuery
                ? `No recordings matched "${searchQuery}". Clear your search query.`
                : "After each live session, your trainer uploads the recording link and notes here for you."}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredRecordings.map((recording) => (
              <div
                key={recording.id}
                className="group relative rounded-2xl border border-pt bg-gradient-to-br from-background to-surface/60 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                          Class {recording.classNumber}
                        </span>
                        {recording.level && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {recording.level}
                          </span>
                        )}
                      </div>
                      <h4 className="mt-2 text-base sm:text-lg font-bold text-pt group-hover:text-primary transition-colors leading-snug">
                        {recording.title}
                      </h4>
                      {recording.trainerName && (
                        <p className="text-xs text-pt-muted mt-1">
                          Instructor: <span className="font-medium text-foreground">{recording.trainerName}</span>
                        </p>
                      )}
                    </div>

                    <a
                      href={recording.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md group-hover:scale-110 transition-transform"
                      title="Watch Recording"
                    >
                      <PlayCircle size={24} weight="fill" />
                    </a>
                  </div>

                  {/* Notes Preview if available */}
                  {recording.notes && (
                    <div className="mt-3 rounded-xl bg-surface/80 border border-pt/60 p-2.5 text-xs text-pt-muted flex items-start gap-2">
                      <Info size={15} className="shrink-0 text-primary mt-0.5" />
                      <p className="line-clamp-2">{recording.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-pt/40 flex items-center justify-between gap-2">
                  <a
                    href={recording.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    Open Recording
                    <ArrowSquareOut size={14} />
                  </a>

                  <div className="flex items-center gap-1">
                    {recording.notes && (
                      <button
                        type="button"
                        onClick={() => setActiveNotesRecording(recording)}
                        className="rounded-lg p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-pt transition-colors"
                        title="View Class Notes"
                      >
                        <FileText size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, recording)}
                      className="rounded-lg p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-pt transition-colors flex items-center gap-1"
                      title="Copy Recording Link"
                    >
                      {copiedId === recording.id ? (
                        <Check size={15} className="text-emerald-500" />
                      ) : (
                        <Copy size={15} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Coming Soon Slots */}
      {progress?.nextTwo && progress.nextTwo.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-pt mb-4 flex items-center gap-2">
            <Clock size={22} weight="duotone" className="text-pt-muted" />
            Upcoming Class Schedule
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {progress.nextTwo.map((slot) => (
              <div
                key={slot.classNumber}
                className="rounded-2xl border-2 border-dashed border-pt/60 bg-surface/40 p-5"
              >
                <div className="flex items-center gap-2 text-pt-muted">
                  <Clock size={18} weight="duotone" />
                  <span className="text-xs font-bold uppercase tracking-wide">Scheduled</span>
                </div>
                <p className="mt-3 text-lg font-bold text-pt">Class {slot.classNumber}</p>
                <p className="text-sm text-pt-muted mt-1">
                  {slot.weekdayLabel} · {slot.dateLabel}
                </p>
                <p className="text-sm text-pt-muted">{slot.timeLabel}</p>
                <p className="mt-3 text-xs text-pt-muted rounded-lg bg-background/80 border border-pt px-3 py-2">
                  Recording will be uploaded after this class finishes.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      {!adminView && (
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/student/classes"
            className="inline-flex items-center gap-2 rounded-xl border border-pt px-4 py-2.5 text-sm font-semibold text-pt hover:bg-surface transition-colors"
          >
            <VideoCamera size={16} weight="duotone" />
            Join live class
          </Link>
          <Link
            href="/student/assignments"
            className="inline-flex items-center gap-2 rounded-xl border border-pt px-4 py-2.5 text-sm font-semibold text-pt hover:bg-surface transition-colors"
          >
            <FilmStrip size={16} weight="duotone" />
            View Assignments
          </Link>
          {progress?.completedCount != null && progress.completedCount > 0 && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              <CheckCircle size={16} weight="fill" />
              {progress.completedCount} class{progress.completedCount === 1 ? "" : "es"} completed
            </div>
          )}
        </div>
      )}

      {/* Notes Modal */}
      {activeNotesRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl border border-pt bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  Class {activeNotesRecording.classNumber} Notes
                </span>
                <h3 className="font-bold text-lg text-pt mt-0.5">
                  {activeNotesRecording.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveNotesRecording(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-2xl border border-pt bg-surface/50 p-4 text-sm text-pt-muted whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {activeNotesRecording.notes || "No extra notes provided for this recording."}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveNotesRecording(null)}
              >
                Close
              </Button>
              <Button asChild size="sm">
                <a
                  href={activeNotesRecording.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ArrowSquareOut size={14} className="mr-1.5" />
                  Open Recording
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
