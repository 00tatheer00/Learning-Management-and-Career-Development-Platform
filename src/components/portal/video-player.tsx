"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Spinner, Warning, XCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  lectureId: string;
  playbackUrl: string;
  initialTime?: number;
  onClose?: () => void;
  onProgressSaved?: (watchedSeconds: number, completed: boolean) => void;
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
  const lastSavedTimeRef = useRef<number>(initialTime);
  const currentTimeRef = useRef<number>(initialTime);
  const durationRef = useRef<number>(0);
  const isCompletedRef = useRef<boolean>(false);

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

  useEffect(() => {
    // 15-second loading timeout
    const timeout = setTimeout(() => {
      if (!isReady) {
        setError("Playback failed to load. Please check your network connection.");
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [isReady]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check: only allow Bunny Stream player domain
      if (!event.origin.includes("mediadelivery.net")) return;

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (data && data.context === "player.js") {
          const iframe = iframeRef.current;

          if (data.event === "ready") {
            setIsReady(true);
            setError(null);

            // Register event listeners
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage(
                JSON.stringify({ method: "addEventListener", value: "timeupdate" }),
                "*"
              );
              iframe.contentWindow.postMessage(
                JSON.stringify({ method: "addEventListener", value: "ended" }),
                "*"
              );
              iframe.contentWindow.postMessage(
                JSON.stringify({ method: "addEventListener", value: "pause" }),
                "*"
              );

              // Seek to the initial saved time
              if (initialTime > 0) {
                iframe.contentWindow.postMessage(
                  JSON.stringify({ method: "setCurrentTime", value: initialTime }),
                  "*"
                );
              }
            }
          } else if (data.event === "timeupdate") {
            const seconds = parseFloat(data.value.seconds);
            const duration = parseFloat(data.value.duration);
            currentTimeRef.current = seconds;
            durationRef.current = duration;

            // Automatically complete at 90% watched
            const progressRatio = duration > 0 ? seconds / duration : 0;
            const completed = progressRatio >= 0.9;

            if (completed && !isCompletedRef.current) {
              isCompletedRef.current = true;
              void saveProgress(seconds, true);
              lastSavedTimeRef.current = seconds;
            } else if (Math.abs(seconds - lastSavedTimeRef.current) >= 5) {
              // Save progress every 5 seconds to reduce API stress
              void saveProgress(seconds, isCompletedRef.current);
              lastSavedTimeRef.current = seconds;
            }
          } else if (data.event === "pause") {
            void saveProgress(currentTimeRef.current, isCompletedRef.current);
            lastSavedTimeRef.current = currentTimeRef.current;
          } else if (data.event === "ended") {
            isCompletedRef.current = true;
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
      // Save progress on close/unmount
      if (currentTimeRef.current > 0) {
        void saveProgress(currentTimeRef.current, isCompletedRef.current);
      }
    };
  }, [initialTime, lectureId, saveProgress]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl border border-border overflow-hidden shadow-2xl flex items-center justify-center">
      {!isReady && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 text-white gap-3">
          <Spinner size={36} className="animate-spin text-primary" />
          <p className="text-sm font-semibold tracking-wide animate-pulse">
            Configuring secure connection...
          </p>
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
        className="w-full h-full border-0"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
      />
    </div>
  );
}
