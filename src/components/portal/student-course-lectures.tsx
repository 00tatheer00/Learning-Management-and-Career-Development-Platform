"use client";

import { useState, useMemo } from "react";
import {
  Check,
  Play,
  Clock,
  ArrowRight,
  X,
  FilmStrip,
  CheckCircle,
} from "@phosphor-icons/react";
import { VideoPlayer } from "./video-player";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";

interface Lecture {
  id: string;
  title: string;
  description: string;
  bunnyVideoId: string | null;
  duration: number | null;
  order: number;
  programSlug: string;
  level: string | null;
}

interface Progress {
  watchedSeconds: number;
  completed: boolean;
}

interface StudentCourseLecturesProps {
  lectures: Lecture[];
  initialProgress: Record<string, Progress>;
  studentInfo?: {
    email?: string;
    name?: string;
    id?: string;
  };
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "Duration pending";
  const totalSecs = Math.round(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins} mins`;
  return `${mins}m ${secs}s`;
}

function formatBadgeDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "--:--";
  const totalSecs = Math.round(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function StudentCourseLectures({
  lectures: initialLectures,
  initialProgress,
  studentInfo,
}: StudentCourseLecturesProps) {
  const [lectures, setLectures] = useState<Lecture[]>(initialLectures);
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>(initialProgress);
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "in-progress" | "completed">("all");

  // Determine hero featured lecture (Resume watching > First unwatched > First lecture)
  const resumeLecture = useMemo(() => {
    const inProg = lectures.find((lecture) => {
      const prog = progressMap[lecture.id];
      return prog && prog.watchedSeconds > 0 && !prog.completed;
    });
    if (inProg) return inProg;
    const firstUnwatched = lectures.find((lecture) => !progressMap[lecture.id]?.completed);
    return firstUnwatched || lectures[0] || null;
  }, [lectures, progressMap]);

  const handlePlay = async (lecture: Lecture) => {
    setActiveLecture(lecture);
    setLoadingUrl(true);
    setPlaybackUrl(null);
    try {
      const res = await fetch(`/api/student/lecture/${lecture.id}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setPlaybackUrl(json.data.playbackUrl);
        if (json.data.lecture?.duration && json.data.lecture.duration !== lecture.duration) {
          setLectures((prev) =>
            prev.map((item) =>
              item.id === lecture.id ? { ...item, duration: json.data.lecture.duration } : item
            )
          );
        }
      } else {
        toast.error(json.error ?? "Failed to load video player");
        setActiveLecture(null);
      }
    } catch {
      toast.error("Failed to load video player");
      setActiveLecture(null);
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleProgressSaved = (watchedSeconds: number, completed: boolean) => {
    if (!activeLecture) return;
    setProgressMap((prev) => ({
      ...prev,
      [activeLecture.id]: { watchedSeconds, completed },
    }));
  };

  const activeIndex = activeLecture ? lectures.findIndex((l) => l.id === activeLecture.id) : -1;
  const hasNextLecture = activeIndex >= 0 && activeIndex < lectures.length - 1;
  const hasPrevLecture = activeIndex > 0;
  const nextLecture = hasNextLecture ? lectures[activeIndex + 1] : null;
  const prevLecture = hasPrevLecture ? lectures[activeIndex - 1] : null;

  // Filter lectures
  const filteredLectures = useMemo(() => {
    return lectures.filter((lecture) => {
      const prog = progressMap[lecture.id];
      if (filterTab === "in-progress") {
        return prog && prog.watchedSeconds > 0 && !prog.completed;
      }
      if (filterTab === "completed") {
        return prog?.completed;
      }
      return true;
    });
  }, [lectures, progressMap, filterTab]);

  return (
    <div className="space-y-10">
      {/* 🎬 Apple-Style Cinema Hero Card */}
      {resumeLecture && !activeLecture && (
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 sm:p-9 text-white shadow-2xl transition-all duration-300 group">
          {/* Ambient Lighting / Glow Effect */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-[100px] pointer-events-none group-hover:bg-primary/25 transition-all duration-500" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-purple-500/10 blur-[90px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-[10px] font-extrabold text-white uppercase tracking-widest border border-white/15">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                  {progressMap[resumeLecture.id]?.watchedSeconds ? "Resume Class" : "Featured Class"}
                </span>
                <span className="rounded-full bg-primary/20 px-3 py-1 text-[10px] font-extrabold text-primary uppercase tracking-widest border border-primary/30">
                  {resumeLecture.level || "Class Recording"}
                </span>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border border-white/5">
                  1080p HD
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {resumeLecture.title}
              </h2>

              {resumeLecture.description && (
                <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed font-normal">
                  {resumeLecture.description}
                </p>
              )}

              {/* Progress Gauge */}
              {resumeLecture.duration && (
                <div className="pt-2 space-y-2 max-w-md">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-primary" />
                      {formatDuration(resumeLecture.duration)}
                    </span>
                    {progressMap[resumeLecture.id]?.watchedSeconds ? (
                      <span className="text-primary font-bold">
                        {Math.round(
                          ((progressMap[resumeLecture.id]?.watchedSeconds ?? 0) /
                            resumeLecture.duration) *
                            100
                        )}
                        % Watched
                      </span>
                    ) : (
                      <span>Unwatched</span>
                    )}
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden backdrop-blur-md">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          ((progressMap[resumeLecture.id]?.watchedSeconds ?? 0) /
                            resumeLecture.duration) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Apple Style Floating Action Pill */}
            <div className="shrink-0 flex items-center">
              <button
                type="button"
                onClick={() => handlePlay(resumeLecture)}
                className="flex items-center gap-3 bg-white text-zinc-950 hover:bg-zinc-100 font-extrabold text-sm sm:text-base px-7 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group/btn cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950 text-white">
                  <Play size={14} weight="fill" className="ml-0.5" />
                </div>
                <span>
                  {progressMap[resumeLecture.id]?.watchedSeconds ? "Continue Watching" : "Watch Class 1"}
                </span>
                <ArrowRight size={16} className="text-zinc-600 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎞️ Apple-Grade Episodes Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h3 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <FilmStrip size={22} weight="duotone" className="text-primary" />
              Class Episodes &amp; Archives
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select an episode to launch the secure cinema player.
            </p>
          </div>

          {/* Segmented iOS Style Filter Control */}
          <div className="inline-flex items-center rounded-2xl bg-surface/70 border border-border/80 p-1 backdrop-blur-md shadow-inner text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={cn(
                "rounded-xl px-3.5 py-1.5 transition-all cursor-pointer",
                filterTab === "all"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All ({lectures.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("in-progress")}
              className={cn(
                "rounded-xl px-3.5 py-1.5 transition-all cursor-pointer",
                filterTab === "in-progress"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("completed")}
              className={cn(
                "rounded-xl px-3.5 py-1.5 transition-all cursor-pointer",
                filterTab === "completed"
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Cinematic Video Cards Grid */}
        {filteredLectures.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-surface/30">
            <FilmStrip size={40} className="mx-auto text-muted-foreground/60" />
            <p className="font-bold text-sm text-foreground mt-3">No episodes in this filter</p>
            <p className="text-xs text-muted-foreground mt-1">Switch to &apos;All&apos; to view all recordings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLectures.map((lecture) => {
              const prog = progressMap[lecture.id];
              const isCompleted = prog?.completed ?? false;
              const watched = prog?.watchedSeconds ?? 0;
              const hasStarted = watched > 0;
              const percent = lecture.duration
                ? Math.min(100, Math.round((watched / lecture.duration) * 100))
                : 0;

              return (
                <div
                  key={lecture.id}
                  onClick={() => handlePlay(lecture)}
                  className="group relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-surface/80 via-surface/40 to-surface/20 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Slate Preview Bar + Episode Info */}
                    <div className="relative aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-white/10 overflow-hidden shadow-inner flex items-center justify-center group-hover:border-primary/40 transition-colors">
                      {/* Subtle Ambient Grid Background */}
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                      {/* Episode Badge top-left */}
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                        <span className="rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white border border-white/10">
                          Class #{lecture.order}
                        </span>
                        {lecture.level && (
                          <span className="rounded-lg bg-primary/30 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-primary border border-primary/30">
                            {lecture.level}
                          </span>
                        )}
                      </div>

                      {/* Duration Badge bottom-right */}
                      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-lg bg-black/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono font-bold text-white border border-white/10 shadow-lg">
                        <Clock size={11} className="text-primary" />
                        <span>{formatBadgeDuration(lecture.duration)}</span>
                      </div>

                      {/* Center Floating Play Button */}
                      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-2xl group-hover:scale-115 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        {isCompleted ? (
                          <Check size={22} weight="bold" />
                        ) : (
                          <Play size={22} weight="fill" className="ml-0.5" />
                        )}
                      </div>

                      {/* Bottom Edge Progress Bar */}
                      {hasStarted && !isCompleted && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Metadata Content */}
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-1">
                          {lecture.title}
                        </h4>
                        {isCompleted ? (
                          <span className="shrink-0 flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                            <CheckCircle size={12} weight="fill" />
                            Completed
                          </span>
                        ) : hasStarted ? (
                          <span className="shrink-0 text-[10px] font-bold text-primary">
                            {percent}% watched
                          </span>
                        ) : null}
                      </div>

                      {lecture.description ? (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {lecture.description}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/60 italic">
                          Official lecture recording with study notes and bookmarks.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                      <Clock size={13} />
                      {formatDuration(lecture.duration)}
                    </span>
                    <span className="font-bold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      {isCompleted ? "Rewatch Session" : hasStarted ? "Resume Session" : "Start Session"}
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🎬 Apple Theater Mode Playback Modal */}
      {activeLecture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 sm:p-6 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl rounded-[32px] bg-zinc-950 p-4 sm:p-7 shadow-2xl border border-white/10 max-h-[95vh] overflow-y-auto">
            {/* Top Bar with Title and Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/20 px-3 py-0.5 text-[10px] font-extrabold text-primary uppercase tracking-widest">
                  Class #{activeLecture.order}
                </span>
                <span className="text-xs text-zinc-400 font-medium truncate max-w-md hidden sm:inline">
                  {activeLecture.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveLecture(null);
                  setPlaybackUrl(null);
                }}
                className="flex items-center gap-1.5 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer text-xs font-semibold px-3"
              >
                <X size={16} weight="bold" />
                <span className="hidden sm:inline">Close Player</span>
              </button>
            </div>

            {/* Video Viewport */}
            <div className="mt-4">
              {loadingUrl ? (
                <div className="aspect-video bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center p-6 space-y-3">
                  <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span className="text-xs font-semibold text-zinc-400 tracking-wide">
                    Initializing secure DRM stream...
                  </span>
                </div>
              ) : (
                playbackUrl && (
                  <VideoPlayer
                    lectureId={activeLecture.id}
                    playbackUrl={playbackUrl}
                    studentInfo={studentInfo}
                    initialTime={progressMap[activeLecture.id]?.watchedSeconds ?? 0}
                    hasNextLecture={hasNextLecture}
                    hasPrevLecture={hasPrevLecture}
                    nextLectureTitle={nextLecture?.title}
                    prevLectureTitle={prevLecture?.title}
                    onPlayNext={() => nextLecture && handlePlay(nextLecture)}
                    onPlayPrev={() => prevLecture && handlePlay(prevLecture)}
                    onClose={() => {
                      setActiveLecture(null);
                      setPlaybackUrl(null);
                    }}
                    onProgressSaved={handleProgressSaved}
                  />
                )
              )}
            </div>

            {/* Lecture Meta & Topics */}
            <div className="mt-5 text-left border-t border-zinc-900 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/20 px-3 py-0.5 text-[10px] font-bold text-primary uppercase tracking-widest">
                  {activeLecture.level || "Full Session"}
                </span>
                {activeLecture.duration && (
                  <span className="rounded-full bg-zinc-900 px-3 py-0.5 text-[10px] font-bold text-zinc-400">
                    Duration: {formatDuration(activeLecture.duration)}
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">
                {activeLecture.title}
              </h3>
              {activeLecture.description && (
                <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                  {activeLecture.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
