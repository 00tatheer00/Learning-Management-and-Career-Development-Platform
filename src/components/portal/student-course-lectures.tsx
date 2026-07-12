"use client";

import { useState } from "react";
import { Check, Play, Clock, ArrowRight, X, FilmStrip, PlayCircle } from "@phosphor-icons/react";
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
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 shadow-sm transition-all hover:border-primary/30">
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
                  <div className="w-56 h-2 rounded-full bg-[var(--pt-progress-track)] overflow-hidden">
                    <div
                      className="h-full bg-primary"
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
                    <span className="text-primary ml-2 font-bold">
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
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-pt tracking-tight">Course Lectures</h3>

        <div className="grid gap-3">
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
                className="group rounded-2xl border border-pt bg-gradient-to-br from-background to-surface/60 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                      <FilmStrip size={12} weight="bold" />
                      Lecture {lecture.order} {lecture.level && `• ${lecture.level}`}
                    </p>

                    <p className="text-lg font-bold text-pt group-hover:text-primary transition-colors">
                      {lecture.title}
                    </p>

                    {lecture.description && (
                      <p className="text-xs text-pt-muted mt-1 leading-relaxed line-clamp-1">{lecture.description}</p>
                    )}

                    <div className="flex items-center gap-3 mt-3 text-xs text-pt-muted font-medium">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDuration(lecture.duration)}
                      </span>
                      {hasStarted && !isCompleted && lecture.duration && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-bold">
                            {percent}% watched
                          </span>
                        </>
                      )}
                    </div>

                    {hasStarted && !isCompleted && lecture.duration && (
                      <div className="w-full max-w-xs h-1 rounded-full bg-[var(--pt-progress-track)] mt-2.5 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                      </div>
                    )}
                  </div>

                  {/* Play Action Squircle matches original page design */}
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md transition-all duration-300",
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-primary text-primary-foreground group-hover:scale-105"
                    )}
                  >
                    {isCompleted ? (
                      <Check size={20} weight="bold" />
                    ) : (
                      <Play size={20} weight="fill" className="ml-0.5" />
                    )}
                  </span>
                </div>

                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {isCompleted ? "Watch again" : hasStarted ? `Resume lesson (${percent}%)` : "Start lesson"}
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
