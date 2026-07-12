"use client";

import { useState } from "react";
import { CheckCircle, Clock, ArrowRight, X } from "@phosphor-icons/react";
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
  if (!seconds) return "0:00";
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

  // Identify the lecture to resume watching (in progress, not completed)
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
    <div className="space-y-6">
      {/* Playback Modal */}
      {activeLecture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-2xl bg-zinc-950 p-4 sm:p-6 shadow-2xl border border-zinc-800">
            <button
              onClick={() => {
                setActiveLecture(null);
                setPlaybackUrl(null);
              }}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mt-6">
              {loadingUrl ? (
                <div className="aspect-video bg-zinc-900 rounded-xl flex items-center justify-center">
                  <div className="text-center text-zinc-400 space-y-2">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-semibold animate-pulse">Initializing secure connection...</p>
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

            <div className="mt-4 text-left">
              <span className="text-[10px] text-primary uppercase font-bold tracking-widest">
                {activeLecture.level || "Video Lesson"}
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">{activeLecture.title}</h3>
              {activeLecture.description && (
                <p className="text-sm text-zinc-400 mt-1">{activeLecture.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resume Watching Banner */}
      {resumeLecture && !activeLecture && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                Resume Watching
              </span>
              <h3 className="text-lg font-bold text-pt mt-2">{resumeLecture.title}</h3>
              <p className="text-sm text-pt-muted line-clamp-1">{resumeLecture.description}</p>

              {resumeLecture.duration && (
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
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
                  <span className="text-xs text-pt-muted">
                    {formatDuration(progressMap[resumeLecture.id]?.watchedSeconds ?? 0)} /{" "}
                    {formatDuration(resumeLecture.duration)}
                  </span>
                </div>
              )}
            </div>
            <Button onClick={() => handlePlay(resumeLecture)} size="lg" className="shrink-0 group">
              Resume Lesson
              <ArrowRight size={16} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      )}

      {/* Lectures List */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-pt">Course Lectures</h3>

        <div className="grid gap-3">
          {lectures.map((lecture) => {
            const prog = progressMap[lecture.id];
            const isCompleted = prog?.completed ?? false;
            const watched = prog?.watchedSeconds ?? 0;
            const hasStarted = watched > 0;

            return (
              <div
                key={lecture.id}
                onClick={() => handlePlay(lecture)}
                className={cn(
                  "group rounded-2xl p-5 border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5 transition-all",
                  isCompleted ? "border-emerald-500/20 bg-emerald-500/[0.01]" : "border-border"
                )}
              >
                <div className="flex gap-4 items-start">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-lg transition-colors",
                      isCompleted
                        ? "bg-emerald-500/10 text-emerald-600"
                        : hasStarted
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <CheckCircle size={24} weight="fill" /> : lecture.order}
                  </div>
                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pt-faint">
                        Video Lesson
                      </span>
                      {lecture.level && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-muted text-pt-muted">
                          {lecture.level}
                        </span>
                      )}
                    </div>
                    <h4
                      className={cn(
                        "font-semibold text-lg text-pt mt-1 group-hover:text-primary transition-colors",
                        isCompleted && "text-emerald-950/90 dark:text-emerald-50/90"
                      )}
                    >
                      {lecture.title}
                    </h4>
                    {lecture.description && (
                      <p className="text-sm text-pt-muted mt-0.5 line-clamp-1">{lecture.description}</p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-xs text-pt-muted">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDuration(lecture.duration)}
                      </span>
                      {hasStarted && !isCompleted && lecture.duration && (
                        <>
                          <span>·</span>
                          <span className="text-primary font-medium">
                            {Math.round((watched / lecture.duration) * 100)}% watched
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="self-end sm:self-center shrink-0">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-500/20">
                      Completed
                    </span>
                  ) : hasStarted ? (
                    <Button variant="secondary" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20">
                      Resume
                    </Button>
                  ) : (
                    <Button size="sm">Start Lesson</Button>
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
