"use client";

import { useState } from "react";
import { Check, Play, Clock, ArrowRight, X, FilmStrip, ArrowClockwise } from "@phosphor-icons/react";
import { VideoPlayer } from "./video-player";
import { Button } from "@/components/ui/button";
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
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "Duration pending";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins} mins`;
  return `${mins}m ${secs}s`;
}

function formatProgressTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function StudentCourseLectures({
  lectures,
  initialProgress,
}: StudentCourseLecturesProps) {
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>(initialProgress);
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  const resumeLecture = lectures.find((lecture) => {
    const prog = progressMap[lecture.id];
    return prog && prog.watchedSeconds > 0 && !prog.completed;
  });

  const handlePlay = async (lecture: Lecture) => {
    setActiveLecture(lecture);
    setLoadingUrl(true);
    setPlaybackUrl(null);
    try {
      const res = await fetch(`/api/student/lecture/${lecture.id}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setPlaybackUrl(json.data.playbackUrl);
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

  return (
    <div className="space-y-8">
      {/* Playback Modal */}
      {activeLecture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-3xl bg-zinc-950 p-5 sm:p-7 shadow-2xl border border-zinc-800">
            <button
              onClick={() => {
                setActiveLecture(null);
                setPlaybackUrl(null);
              }}
              className="absolute right-5 top-5 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-200"
            >
              <X size={20} weight="bold" />
            </button>

            <div className="mt-8">
              {loadingUrl ? (
                <div className="aspect-video bg-zinc-900 rounded-2xl flex items-center justify-center">
                  <div className="text-center text-zinc-400 space-y-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-semibold animate-pulse tracking-wide">Configuring secure stream connection...</p>
                  </div>
                </div>
              ) : (
                playbackUrl && (
                  <VideoPlayer
                    lectureId={activeLecture.id}
                    playbackUrl={playbackUrl}
                    initialTime={progressMap[activeLecture.id]?.watchedSeconds ?? 0}
                    onClose={() => {
                      setActiveLecture(null);
                      setPlaybackUrl(null);
                    }}
                    onProgressSaved={handleProgressSaved}
                  />
                )
              )}
            </div>

            <div className="mt-5 text-left border-t border-zinc-900 pt-4">
              <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-0.5 text-[10px] font-bold text-primary uppercase tracking-widest">
                {activeLecture.level || "Video Lesson"}
              </span>
              <h3 className="text-xl font-bold text-white mt-2">{activeLecture.title}</h3>
              {activeLecture.description && (
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{activeLecture.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resume Watching Banner */}
      {resumeLecture && !activeLecture && (
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 shadow-md transition-all hover:border-primary/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3.5 py-1 text-[10px] font-bold text-primary uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                Resume Watching
              </span>
              <h3 className="text-xl font-bold text-pt mt-2">{resumeLecture.title}</h3>
              <p className="text-sm text-pt-muted line-clamp-1 max-w-xl">{resumeLecture.description}</p>

              {resumeLecture.duration && (
                <div className="flex items-center gap-4 pt-3">
                  <div className="w-56 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary-light"
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
                  <span className="text-xs font-semibold text-pt-muted">
                    {formatProgressTime(progressMap[resumeLecture.id]?.watchedSeconds ?? 0)} /{" "}
                    {formatProgressTime(resumeLecture.duration)}
                    <span className="text-primary ml-2">
                      ({Math.round(((progressMap[resumeLecture.id]?.watchedSeconds ?? 0) / resumeLecture.duration) * 100)}% watched)
                    </span>
                  </span>
                </div>
              )}
            </div>
            <Button onClick={() => handlePlay(resumeLecture)} size="lg" className="shrink-0 group rounded-xl px-6">
              Resume Lesson
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      )}

      {/* Lectures List */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xl text-pt tracking-tight">Course Lectures</h3>
          <span className="text-xs text-pt-muted font-medium bg-muted px-2.5 py-1 rounded-lg">
            {lectures.length} lessons available
          </span>
        </div>

        <div className="grid gap-4">
          {lectures.map((lecture) => {
            const prog = progressMap[lecture.id];
            const isCompleted = prog?.completed ?? false;
            const watched = prog?.watchedSeconds ?? 0;
            const hasStarted = watched > 0;
            const percent = lecture.duration ? Math.min(100, Math.round((watched / lecture.duration) * 100)) : 0;

            return (
              <div
                key={lecture.id}
                onClick={() => handlePlay(lecture)}
                className={cn(
                  "group rounded-2xl p-5 border bg-background flex flex-col md:flex-row md:items-center justify-between gap-5 cursor-pointer hover:border-primary/45 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300",
                  isCompleted ? "border-emerald-500/20 bg-emerald-500/[0.01]" : "border-border"
                )}
              >
                <div className="flex gap-4 items-center flex-1">
                  {/* Play/Complete Premium Icon Container */}
                  <div
                    className={cn(
                      "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-extrabold text-lg transition-all duration-300 shadow-sm",
                      isCompleted
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 group-hover:scale-105"
                        : hasStarted
                        ? "bg-primary/10 text-primary border border-primary/20 group-hover:scale-105"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary group-hover:scale-105"
                    )}
                  >
                    {isCompleted ? (
                      <Check size={28} weight="bold" />
                    ) : (
                      <Play size={24} weight="fill" className="ml-1 text-primary group-hover:scale-110 transition-transform" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest text-pt-faint">
                        <FilmStrip size={11} />
                        Lecture {lecture.order}
                      </span>
                      {lecture.level && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-pt-muted">
                          {lecture.level}
                        </span>
                      )}
                    </div>

                    <h4
                      className={cn(
                        "font-bold text-lg text-pt leading-snug group-hover:text-primary transition-colors",
                        isCompleted && "text-emerald-950/90 dark:text-emerald-50/90"
                      )}
                    >
                      {lecture.title}
                    </h4>

                    {lecture.description && (
                      <p className="text-sm text-pt-muted line-clamp-1 max-w-2xl">{lecture.description}</p>
                    )}

                    {/* Progress Bar & Stats */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 text-xs text-pt-muted font-medium">
                      <span className="flex items-center gap-1.5">
                        <Clock size={15} />
                        {formatDuration(lecture.duration)}
                      </span>

                      {hasStarted && !isCompleted && lecture.duration && (
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <span className="hidden sm:inline text-pt-faint">•</span>
                          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                            <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-primary font-bold text-xs">
                            {percent}% watched
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="self-end md:self-center shrink-0">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-600 border border-emerald-500/20 shadow-sm animate-fade-in">
                      <Check size={14} weight="bold" />
                      Completed
                    </span>
                  ) : hasStarted ? (
                    <Button variant="secondary" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 rounded-xl px-4 font-bold border border-primary/20">
                      <ArrowClockwise size={14} className="mr-1.5" />
                      Resume ({percent}%)
                    </Button>
                  ) : (
                    <Button size="sm" className="rounded-xl px-4 font-bold">
                      Start Lesson
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
