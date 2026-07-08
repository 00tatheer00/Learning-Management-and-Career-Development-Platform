import Link from "next/link";
import { CheckCircle, Clock, FilmStrip, PlayCircle } from "@phosphor-icons/react/ssr";
import { getClassRecordings } from "@/lib/api/class-recordings";
import { getClassProgress } from "@/lib/class-schedule";
import { getProgramCategory, PREMIUM_HEADER_GRADIENT_FALLBACK } from "@/lib/constants/program-categories";
import { cn } from "@/lib/utils";

interface StudentClassProgressCardProps {
  programSlug: string;
}

export async function StudentClassProgressCard({ programSlug }: StudentClassProgressCardProps) {
  const progress = getClassProgress(programSlug);
  const recordings = await getClassRecordings(programSlug);
  const category = getProgramCategory(programSlug);

  if (!progress.config) return null;

  const highlightSlots = progress.slots.slice(
    Math.max(0, progress.completedCount - 1),
    Math.min(progress.slots.length, progress.completedCount + 3)
  );

  return (
    <div
      className={cn(
        "rounded-2xl border border-pt overflow-hidden shadow-sm bg-gradient-to-br from-background to-surface/50"
      )}
    >
      <div
        className={cn(
          "px-5 py-4 text-white bg-gradient-to-r",
          category?.headerGradient ?? PREMIUM_HEADER_GRADIENT_FALLBACK
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
              Class Progress
            </p>
            <p className="text-lg font-bold mt-0.5">
              {progress.completedCount} done
              {progress.todaySlot ? ` · Class ${progress.todaySlot.classNumber} today` : ""}
            </p>
          </div>
          <Link
            href="/student/recordings"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur px-3 py-2 text-xs font-bold hover:bg-white/30 transition-colors"
          >
            <FilmStrip size={14} weight="duotone" />
            Recordings
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-xs text-pt-muted mb-3">
          {progress.config.daysLabel} · {progress.config.timeLabel} PKT
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {highlightSlots.map((slot) => {
            const isDone = slot.status === "done";
            const isToday = slot.status === "today" || slot.status === "live";
            const hasRecording = recordings.some((r) => r.classNumber === slot.classNumber);
            return (
              <div
                key={slot.classNumber}
                className={cn(
                  "min-w-[120px] rounded-xl border px-3 py-2.5 text-center",
                  isDone && "border-[#4a6b58]/25 bg-[#4a6b58]/5",
                  isToday && "border-primary/40 bg-primary/5 ring-1 ring-primary/20",
                  !isDone && !isToday && "border-pt bg-surface/50"
                )}
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-pt-muted">
                  Class {slot.classNumber}
                </p>
                <p className="text-xs font-semibold text-pt mt-1">
                  {isDone ? "Done" : isToday ? (slot.status === "live" ? "Live" : "Today") : "Soon"}
                </p>
                {isDone && hasRecording && (
                  <PlayCircle size={14} className="mx-auto mt-1 text-[#4a5c52]" weight="fill" />
                )}
                {isDone && !hasRecording && (
                  <Clock size={14} className="mx-auto mt-1 text-pt-muted" />
                )}
              </div>
            );
          })}
        </div>
        {progress.completedCount > 0 && (
          <p className="mt-3 text-xs text-pt-muted flex items-center gap-1.5">
            <CheckCircle size={14} className="text-[#4a5c52]" weight="fill" />
            {recordings.length} recording{recordings.length === 1 ? "" : "s"} available —{" "}
            <Link href="/student/recordings" className="text-primary font-semibold underline">
              watch now
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
