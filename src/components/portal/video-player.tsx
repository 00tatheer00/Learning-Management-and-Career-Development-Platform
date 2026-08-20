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
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  lectureId: string;
  playbackUrl: string;
  initialTime?: number;
  onClose?: () => void;
  onProgressSaved?: (watchedSeconds: number, completed: boolean) => void;
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
  initialTime = 0,
  onClose,
  onProgressSaved,
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showResumeBanner, setShowResumeBanner] = useState(initialTime > 10);
  const [currentProgressPct, setCurrentProgressPct] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const lastSavedTimeRef = useRef<number>(initialTime);
  const currentTimeRef = useRef<number>(initialTime);
  const durationRef = useRef<number>(0);
  const isCompletedRef = useRef<boolean>(false);

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

  // Save watch progress to database
  const saveProgress = useCallback(
    async (seconds: number, completed: boolean) => {
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
      }
    },
    [lectureId, onProgressSaved]
  );

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    postToPlayer("setPlaybackRate", speed);
  };

  const handleSeekDelta = useCallback((deltaSeconds: number) => {
    const target = Math.max(0, Math.min(currentTimeRef.current + deltaSeconds, durationRef.current || 99999));
    postToPlayer("setCurrentTime", target);
    currentTimeRef.current = target;
  }, [postToPlayer]);

  const handleRestartFromBeginning = () => {
    postToPlayer("setCurrentTime", 0);
    currentTimeRef.current = 0;
    setShowResumeBanner(false);
  };

  useEffect(() => {
    // 15-second loading timeout
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
      // Security check: only allow Bunny Stream player domain
      if (!event.origin.includes("mediadelivery.net")) return;

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (data && data.context === "player.js") {
          if (data.event === "ready") {
            setIsReady(true);
            setError(null);

            // Register event listeners
            postToPlayer("addEventListener", "timeupdate");
            postToPlayer("addEventListener", "ended");
            postToPlayer("addEventListener", "pause");

            // Seek to initial time if available
            if (initialTime > 0) {
              postToPlayer("setCurrentTime", initialTime);
            }
          } else if (data.event === "timeupdate") {
            const seconds = parseFloat(data.value.seconds);
            const duration = parseFloat(data.value.duration);
            currentTimeRef.current = seconds;
            durationRef.current = duration;

            const progressRatio = duration > 0 ? seconds / duration : 0;
            setCurrentProgressPct(Math.min(100, Math.round(progressRatio * 100)));

            // Automatically complete at 90% watched
            const completed = progressRatio >= 0.9;

            if (completed && !isCompletedRef.current) {
              isCompletedRef.current = true;
              setIsCompleted(true);
              void saveProgress(seconds, true);
              lastSavedTimeRef.current = seconds;
            } else if (Math.abs(seconds - lastSavedTimeRef.current) >= 5) {
              // Save progress every 5 seconds
              void saveProgress(seconds, isCompletedRef.current);
              lastSavedTimeRef.current = seconds;
            }
          } else if (data.event === "pause") {
            void saveProgress(currentTimeRef.current, isCompletedRef.current);
            lastSavedTimeRef.current = currentTimeRef.current;
          } else if (data.event === "ended") {
            isCompletedRef.current = true;
            setIsCompleted(true);
            void saveProgress(currentTimeRef.current, true);
            lastSavedTimeRef.current = currentTimeRef.current;
          }
        }
      } catch {
        // Ignore non-json logs
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      if (currentTimeRef.current > 0) {
        void saveProgress(currentTimeRef.current, isCompletedRef.current);
      }
    };
  }, [initialTime, lectureId, postToPlayer, saveProgress]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["input", "textarea"].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleSeekDelta(-10);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleSeekDelta(10);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSeekDelta]);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative w-full aspect-video bg-black rounded-2xl border border-border overflow-hidden shadow-2xl flex items-center justify-center group">
        {!isReady && !error && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 text-white gap-3">
            <Spinner size={36} className="animate-spin text-primary" />
            <p className="text-sm font-semibold tracking-wide animate-pulse">
              Configuring secure connection...
            </p>
          </div>
        )}

        {/* Resume position toast notification */}
        {showResumeBanner && initialTime > 10 && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5 bg-black/85 backdrop-blur-md border border-white/10 text-white px-3.5 py-2 rounded-xl text-xs shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <ClockCounterClockwise size={16} className="text-primary" weight="bold" />
            <span>Resumed at <strong>{formatTime(initialTime)}</strong></span>
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
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
        />
      </div>

      {/* Playback Control Bar */}
      {isReady && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 rounded-xl bg-surface border border-border text-xs">
          {/* Quick Seek Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSeekDelta(-10)}
              title="Skip back 10 seconds (Left Arrow)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-surface text-foreground transition-colors cursor-pointer"
            >
              <ArrowCounterClockwise size={14} weight="bold" />
              <span>-10s</span>
            </button>
            <button
              type="button"
              onClick={() => handleSeekDelta(10)}
              title="Skip forward 10 seconds (Right Arrow)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-surface text-foreground transition-colors cursor-pointer"
            >
              <ArrowClockwise size={14} weight="bold" />
              <span>+10s</span>
            </button>
            <span className="text-muted text-[11px] hidden sm:inline ml-1">
              Progress: {currentProgressPct}%
            </span>
          </div>

          {/* Playback Speed Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-muted text-[11px] mr-1">
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
                    : "bg-surface hover:bg-border text-muted hover:text-foreground border border-border"
                )}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
