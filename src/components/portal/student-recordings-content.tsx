import Link from "next/link";
import {
  CheckCircle,
  Clock,
  PlayCircle,
  Sparkle,
  VideoCamera,
  ArrowSquareOut,
} from "@phosphor-icons/react/ssr";
import type { ClassRecordingRecord } from "@/lib/api/class-recordings";
import { getClassProgress, type ClassSlot } from "@/lib/class-schedule";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { cn } from "@/lib/utils";

interface StudentRecordingsContentProps {
  programSlug: string;
  recordings: ClassRecordingRecord[];
  adminView?: boolean;
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
  recordings,
  adminView = false,
}: StudentRecordingsContentProps) {
  const progress = getClassProgress(programSlug);
  const category = getProgramCategory(programSlug);
  const recordingByClass = new Map(recordings.map((r) => [r.classNumber, r]));
  const recentSlots = progress.slots.slice(
    Math.max(0, progress.completedCount - 1),
    Math.min(progress.slots.length, progress.completedCount + 4)
  );

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8 text-white shadow-xl bg-gradient-to-br",
          category?.headerGradient ?? "from-orange-500 to-amber-500"
        )}
      >
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-6 bottom-0 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-widest">
            <Sparkle size={14} weight="fill" />
            Class Journey
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
            {progress.config?.programTitle ?? "Your Classes"}
          </h2>
          <p className="mt-2 text-sm text-white/90 max-w-xl">
            {progress.config?.daysLabel} · {progress.config?.timeLabel} (Pakistan time)
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="rounded-2xl bg-white/15 backdrop-blur px-4 py-3 border border-white/20">
              <p className="text-[10px] uppercase tracking-wider text-white/80">Completed</p>
              <p className="text-2xl font-bold">{progress.completedCount}</p>
            </div>
            {progress.todaySlot && (
              <div className="rounded-2xl bg-white/15 backdrop-blur px-4 py-3 border border-white/20">
                <p className="text-[10px] uppercase tracking-wider text-white/80">Today</p>
                <p className="text-lg font-bold">Class {progress.todaySlot.classNumber}</p>
              </div>
            )}
            {progress.nextTwo[0] && (
              <div className="rounded-2xl bg-white/15 backdrop-blur px-4 py-3 border border-white/20">
                <p className="text-[10px] uppercase tracking-wider text-white/80">Next</p>
                <p className="text-lg font-bold">Class {progress.nextTwo[0].classNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>

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
                  <p className="mt-2 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                    Recording available
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {progress.todaySlot && (
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

      <div>
        <h3 className="text-lg font-bold text-pt mb-4 flex items-center gap-2">
          <PlayCircle size={22} weight="duotone" className="text-primary" />
          Class Recordings
        </h3>
        {recordings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-pt p-8 text-center">
            <p className="font-semibold text-pt">No recordings yet</p>
        <p className="text-sm text-pt-muted mt-2 max-w-md mx-auto">
          After each class, your trainer will upload the recording link here. Access is limited to
          portal students on Google Drive.
        </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {recordings.map((recording) => (
              <a
                key={recording.id}
                href={recording.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-pt bg-gradient-to-br from-background to-surface/60 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      Class {recording.classNumber}
                    </p>
                    <p className="mt-1 text-lg font-bold text-pt group-hover:text-primary transition-colors">
                      {recording.title}
                    </p>
                    <p className="text-xs text-pt-muted mt-1">By {recording.trainerName}</p>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md group-hover:scale-105 transition-transform">
                    <PlayCircle size={24} weight="fill" />
                  </span>
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Watch recording
                  <ArrowSquareOut size={14} />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {progress.nextTwo.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-pt mb-4 flex items-center gap-2">
            <Clock size={22} weight="duotone" className="text-pt-muted" />
            Coming Soon
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {progress.nextTwo.map((slot) => (
              <div
                key={slot.classNumber}
                className="rounded-2xl border-2 border-dashed border-pt/60 bg-surface/40 p-5"
              >
                <div className="flex items-center gap-2 text-pt-muted">
                  <Clock size={18} weight="duotone" />
                  <span className="text-xs font-bold uppercase tracking-wide">Coming soon</span>
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

      {!adminView && (
        <div className="flex flex-wrap gap-3">
          <Link
            href="/student/classes"
            className="inline-flex items-center gap-2 rounded-xl border border-pt px-4 py-2.5 text-sm font-semibold text-pt hover:bg-surface transition-colors"
          >
            <VideoCamera size={16} weight="duotone" />
            Join live class
          </Link>
          {progress.completedCount > 0 && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              <CheckCircle size={16} weight="fill" />
              {progress.completedCount} class{progress.completedCount === 1 ? "" : "es"} completed
            </div>
          )}
        </div>
      )}
    </div>
  );
}
