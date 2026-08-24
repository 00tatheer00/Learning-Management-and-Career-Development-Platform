"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Spinner,
  Warning,
  XCircle,
  ClockCounterClockwise,
  ArrowCounterClockwise,
  ArrowClockwise,
  CheckCircle,
  Gauge,
  Notebook,
  Plus,
  Trash,
  CaretLeft,
  CaretRight,
  BookmarkSimple,
  Play,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StudyNote {
  id: string;
  timestamp: number;
  text: string;
  createdAt: string;
}

interface VideoPlayerProps {
  lectureId: string;
  playbackUrl: string;
  studentInfo?: {
    email?: string;
    name?: string;
    id?: string;
  };
  initialTime?: number;
  onClose?: () => void;
  onProgressSaved?: (watchedSeconds: number, completed: boolean) => void;
  hasNextLecture?: boolean;
  hasPrevLecture?: boolean;
  nextLectureTitle?: string;
  prevLectureTitle?: string;
  onPlayNext?: () => void;
  onPlayPrev?: () => void;
}

const PLAYBACK_SPEEDS = [0.75, 1.0, 1.25, 1.5, 2.0];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VideoPlayer({
  lectureId,
  playbackUrl,
  studentInfo,
  initialTime = 0,
  onClose,
  onProgressSaved,
  hasNextLecture = false,
  hasPrevLecture = false,
  nextLectureTitle,
  prevLectureTitle,
  onPlayNext,
  onPlayPrev,
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showResumeBanner, setShowResumeBanner] = useState(initialTime > 10);
  const [currentProgressPct, setCurrentProgressPct] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showNextPrompt, setShowNextPrompt] = useState<boolean>(false);

  // Study Notes State
  const [notesOpen, setNotesOpen] = useState<boolean>(false);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [newNoteText, setNewNoteText] = useState<string>("");

  const lastSavedTimeRef = useRef<number>(initialTime);
  const currentTimeRef = useRef<number>(initialTime);
  const durationRef = useRef<number>(0);
  const isCompletedRef = useRef<boolean>(false);
  const isSavingProgressRef = useRef<boolean>(false);

  // Send message to Bunny iframe player
  const postToPlayer = useCallback((method: string, value?: unknown) => {
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify(value !== undefined ? { method, value } : { method }),
        "*"
      );
    }
  }, []);

  // Watermark Positioning State
  const [watermarkPos, setWatermarkPos] = useState<{
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  }>({
    top: "16%",
    left: "14%",
  });
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.35);

  // Dynamic Floating Forensic Watermark Timer
  useEffect(() => {
    const positions = [
      { top: "14%", left: "12%", right: "auto", bottom: "auto" },
      { top: "20%", right: "14%", left: "auto", bottom: "auto" },
      { top: "68%", left: "18%", right: "auto", bottom: "auto" },
      { top: "58%", right: "16%", left: "auto", bottom: "auto" },
      { top: "38%", left: "42%", right: "auto", bottom: "auto" },
      { top: "78%", left: "25%", right: "auto", bottom: "auto" },
      { top: "15%", right: "32%", left: "auto", bottom: "auto" },
      { top: "48%", left: "12%", right: "auto", bottom: "auto" },
    ];

    const interval = setInterval(() => {
      const nextPos = positions[Math.floor(Math.random() * positions.length)];
      setWatermarkPos(nextPos);
      setWatermarkOpacity(0.25 + Math.random() * 0.25);
    }, 6500);

    return () => clearInterval(interval);
  }, []);

  // Load saved notes for this lecture
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`eest_notes_${lectureId}`);
      if (stored) {
        setNotes(JSON.parse(stored));
      } else {
        setNotes([]);
      }
    } catch {
      setNotes([]);
    }
  }, [lectureId]);

  const saveNotesToStorage = (updatedNotes: StudyNote[]) => {
    setNotes(updatedNotes);
    try {
      localStorage.setItem(`eest_notes_${lectureId}`, JSON.stringify(updatedNotes));
    } catch (e) {
      console.error("Failed to save study notes:", e);
    }
  };

  const handleAddNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNoteText.trim()) return;

    const currentSecs = Math.floor(currentTimeRef.current || 0);
    const newNote: StudyNote = {
      id: crypto.randomUUID(),
      timestamp: currentSecs,
      text: newNoteText.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = [...notes, newNote].sort((a, b) => a.timestamp - b.timestamp);
    saveNotesToStorage(updated);
    setNewNoteText("");
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    saveNotesToStorage(updated);
  };

  const handleSeekTo = (targetSecs: number) => {
    postToPlayer("setCurrentTime", targetSecs);
    currentTimeRef.current = targetSecs;
  };

  // Save watch progress to database with in-flight deduplication
  const saveProgress = useCallback(
    async (seconds: number, completed: boolean) => {
      if (isSavingProgressRef.current) return;
      isSavingProgressRef.current = true;
      try {
        const response = await fetch("/api/student/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lectureId,
            watchedSeconds: Math.floor(seconds),
            completed,
          }),
        });
        const data = await response.json();
        if (data.success && onProgressSaved) {
          onProgressSaved(seconds, completed);
        }
      } catch (e) {
        console.error("Failed to save progress:", e);
      } finally {
        isSavingProgressRef.current = false;
      }
    },
    [lectureId, onProgressSaved]
  );

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    postToPlayer("setPlaybackRate", speed);
  };

  const handleSeekDelta = useCallback(
    (deltaSeconds: number) => {
      const target = Math.max(
        0,
        Math.min(currentTimeRef.current + deltaSeconds, durationRef.current || 99999)
      );
      postToPlayer("setCurrentTime", target);
      currentTimeRef.current = target;
    },
    [postToPlayer]
  );

  const handleRestartFromBeginning = () => {
    postToPlayer("setCurrentTime", 0);
    currentTimeRef.current = 0;
    setShowResumeBanner(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isReady) {
        setError("Playback failed to load. Please check your network connection.");
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [isReady]);

  // Auto hide resume banner after 8s
  useEffect(() => {
    if (showResumeBanner) {
      const bannerTimer = setTimeout(() => {
        setShowResumeBanner(false);
      }, 8000);
      return () => clearTimeout(bannerTimer);
    }
  }, [showResumeBanner]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes("mediadelivery.net")) return;

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (data && data.context === "player.js") {
          if (data.event === "ready") {
            setIsReady(true);
            setError(null);

            postToPlayer("addEventListener", "timeupdate");
            postToPlayer("addEventListener", "ended");
            postToPlayer("addEventListener", "pause");

            if (initialTime > 0) {
              postToPlayer("setCurrentTime", initialTime);
            }
          } else if (data.event === "timeupdate") {
            const seconds = parseFloat(data.value.seconds);
            const duration = parseFloat(data.value.duration);
            currentTimeRef.current = seconds;
            durationRef.current = duration;

            const progressRatio = duration > 0 ? seconds / duration : 0;
            const pct = Math.min(100, Math.round(progressRatio * 100));
            setCurrentProgressPct(pct);

            // Automatically complete at 90% watched
            const completed = progressRatio >= 0.9;

            if (completed && !isCompletedRef.current) {
              isCompletedRef.current = true;
              setIsCompleted(true);
              void saveProgress(seconds, true);
              lastSavedTimeRef.current = seconds;
            } else if (Math.abs(seconds - lastSavedTimeRef.current) >= 30) {
              void saveProgress(seconds, isCompletedRef.current);
              lastSavedTimeRef.current = seconds;
            }

            if (progressRatio >= 0.95 && hasNextLecture) {
              setShowNextPrompt(true);
            }
          } else if (data.event === "pause") {
            if (Math.abs(currentTimeRef.current - lastSavedTimeRef.current) >= 1) {
              void saveProgress(currentTimeRef.current, isCompletedRef.current);
              lastSavedTimeRef.current = currentTimeRef.current;
            }
          } else if (data.event === "ended") {
            isCompletedRef.current = true;
            setIsCompleted(true);
            void saveProgress(currentTimeRef.current, true);
            lastSavedTimeRef.current = currentTimeRef.current;
            if (hasNextLecture) {
              setShowNextPrompt(true);
            }
          }
        }
      } catch {
        // Ignore non-json messages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      if (currentTimeRef.current > 0 && Math.abs(currentTimeRef.current - lastSavedTimeRef.current) >= 2) {
        void saveProgress(currentTimeRef.current, isCompletedRef.current);
      }
    };
  }, [hasNextLecture, initialTime, lectureId, postToPlayer, saveProgress]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["input", "textarea"].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleSeekDelta(-10);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleSeekDelta(10);
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        setNotesOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSeekDelta]);

  return (
    <div className="flex flex-col gap-3">
      {/* Video Viewport with Anti-Piracy Shield & Forensic Watermark */}
      <div
        className="relative w-full aspect-video bg-black rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl flex items-center justify-center group select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        {!isReady && !error && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 text-white gap-3">
            <Spinner size={36} className="animate-spin text-primary" />
            <p className="text-sm font-semibold tracking-wide animate-pulse">
              Configuring secure DRM connection...
            </p>
          </div>
        )}

        {/* Dynamic Floating Forensic Anti-Piracy Watermark */}
        {isReady && !error && (
          <div
            style={{
              top: watermarkPos.top,
              bottom: watermarkPos.bottom,
              left: watermarkPos.left,
              right: watermarkPos.right,
              opacity: watermarkOpacity,
              transition: "all 2.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            className="pointer-events-none absolute z-30 select-none font-mono text-[10px] sm:text-xs font-bold text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,1)] flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-xs border border-white/10"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>EEST SECURE • {studentInfo?.email || "AUTHENTICATED STUDENT"}</span>
          </div>
        )}

        {/* Diagonal Micro-Tiled Security Pattern */}
        {isReady && !error && (
          <div className="pointer-events-none absolute inset-0 z-20 select-none opacity-[0.035] overflow-hidden flex flex-wrap gap-12 p-4 text-[9px] font-mono text-white/80">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="rotate-[-25deg] uppercase">
                {studentInfo?.email ?? "EEST PORTAL"} • DRM PROTECTED
              </span>
            ))}
          </div>
        )}



        {/* Resume position toast notification */}
        {showResumeBanner && initialTime > 10 && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5 bg-black/85 backdrop-blur-md border border-white/10 text-white px-3.5 py-2 rounded-xl text-xs shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <ClockCounterClockwise size={16} className="text-primary" weight="bold" />
            <span>
              Resumed at <strong>{formatTime(initialTime)}</strong>
            </span>
            <button
              type="button"
              onClick={handleRestartFromBeginning}
              className="text-primary hover:underline font-semibold ml-1 cursor-pointer"
            >
              Start over
            </button>
            <button
              type="button"
              onClick={() => setShowResumeBanner(false)}
              className="text-white/60 hover:text-white ml-1 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Milestone Completed Badge */}
        {isCompleted && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
            <CheckCircle size={15} weight="fill" className="text-emerald-400" />
            <span>Lecture Completed</span>
          </div>
        )}

        {/* Auto Next Prompt Overlay */}
        {showNextPrompt && hasNextLecture && onPlayNext && (
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3 bg-zinc-950/90 backdrop-blur-md border border-primary/40 text-white p-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase text-primary tracking-wider">
                Up Next
              </p>
              <p className="text-xs font-bold truncate max-w-[180px]">
                {nextLectureTitle || "Next Lecture"}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setShowNextPrompt(false);
                onPlayNext();
              }}
              className="rounded-xl font-bold text-xs gap-1.5 shrink-0"
            >
              <Play size={14} weight="fill" />
              Play Next
            </Button>
            <button
              onClick={() => setShowNextPrompt(false)}
              className="text-zinc-400 hover:text-white p-1 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 text-white p-6 text-center gap-4">
            <Warning size={48} className="text-red-500" />
            <div>
              <h4 className="font-bold text-lg text-red-400">Unable to play video</h4>
              <p className="text-sm text-gray-400 mt-1 max-w-md">{error}</p>
            </div>
            {onClose && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={onClose}
              >
                <XCircle size={16} className="mr-1" />
                Close Player
              </Button>
            )}
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={playbackUrl}
          onLoad={() => setIsReady(true)}
          className="w-full h-full border-0"
          referrerPolicy="no-referrer-when-downgrade"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
        />
      </div>

      {/* Interactive Control & Study Bar */}
      {isReady && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-white">
          {/* Playlist & Quick Seek Controls */}
          <div className="flex items-center gap-2">
            {hasPrevLecture && onPlayPrev && (
              <button
                type="button"
                onClick={onPlayPrev}
                title={prevLectureTitle ? `Previous: ${prevLectureTitle}` : "Previous Lecture"}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
              >
                <CaretLeft size={14} weight="bold" />
                <span className="hidden sm:inline">Prev</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSeekDelta(-10)}
              title="Skip back 10 seconds (Left Arrow)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
            >
              <ArrowCounterClockwise size={14} weight="bold" />
              <span>-10s</span>
            </button>
            <button
              type="button"
              onClick={() => handleSeekDelta(10)}
              title="Skip forward 10 seconds (Right Arrow)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
            >
              <ArrowClockwise size={14} weight="bold" />
              <span>+10s</span>
            </button>

            {hasNextLecture && onPlayNext && (
              <button
                type="button"
                onClick={onPlayNext}
                title={nextLectureTitle ? `Next: ${nextLectureTitle}` : "Next Lecture"}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary/40 bg-primary/20 hover:bg-primary/30 text-primary transition-colors cursor-pointer font-semibold"
              >
                <span className="hidden sm:inline">Next</span>
                <CaretRight size={14} weight="bold" />
              </button>
            )}

            <span className="text-zinc-400 text-[11px] hidden md:inline ml-1">
              Progress: {currentProgressPct}%
            </span>
          </div>

          {/* Right Actions: Speed Switcher & Study Notes Toggle */}
          <div className="flex items-center gap-3">
            {/* Speed Switcher */}
            <div className="flex items-center gap-1">
              <span className="flex items-center gap-1 text-zinc-400 text-[11px] mr-1">
                <Gauge size={14} weight="bold" />
                Speed:
              </span>
              {PLAYBACK_SPEEDS.map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => handleSpeedChange(spd)}
                  className={cn(
                    "px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer",
                    playbackSpeed === spd
                      ? "bg-primary text-white"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700"
                  )}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Study Notes Toggle Button */}
            <button
              type="button"
              onClick={() => setNotesOpen((prev) => !prev)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-semibold text-xs",
                notesOpen
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              )}
            >
              <Notebook size={14} weight={notesOpen ? "fill" : "regular"} />
              <span>Notes ({notes.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Study Notes & Timestamp Bookmarks Panel */}
      {notesOpen && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/95 p-4 text-white text-left space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <BookmarkSimple size={18} className="text-primary" weight="fill" />
              <h4 className="font-bold text-sm text-zinc-100">Study Notes &amp; Timestamps</h4>
            </div>
            <span className="text-[11px] text-zinc-400">
              Notes are saved automatically on this device
            </span>
          </div>

          {/* Add Note Input Form */}
          <form onSubmit={handleAddNote} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder={`Add note at current time (${formatTime(currentTimeRef.current || 0)})...`}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!newNoteText.trim()}
              className="rounded-xl px-3 text-xs font-semibold shrink-0 gap-1"
            >
              <Plus size={14} weight="bold" />
              Add
            </Button>
          </form>

          {/* Notes List */}
          {notes.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-2">
              No notes yet. Type a note above to bookmark key points in this lecture!
            </p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 group hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleSeekTo(note.timestamp)}
                      title="Jump to timestamp"
                      className="shrink-0 flex items-center gap-1 font-mono text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                    >
                      <Play size={10} weight="fill" />
                      {formatTime(note.timestamp)}
                    </button>
                    <p className="text-xs text-zinc-200 leading-relaxed break-words flex-1">
                      {note.text}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    title="Delete note"
                    className="text-zinc-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
