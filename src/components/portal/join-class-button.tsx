"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, VideoCamera } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";
import { getJoinWindowState } from "@/lib/sessions/join-window";

interface JoinClassButtonProps {
  sessionId: string;
  sessionDate: string;
  sessionTime: string;
  programSlug: string;
  hasJoinLink?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function JoinClassButton({
  sessionId,
  sessionDate,
  sessionTime,
  programSlug,
  hasJoinLink = true,
  className,
  size = "lg",
}: JoinClassButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const windowState = useMemo(
    () =>
      getJoinWindowState({
        sessionDate,
        sessionTime,
        programSlug,
        hasJoinLink,
        now,
      }),
    [sessionDate, sessionTime, programSlug, hasJoinLink, now]
  );

  const handleJoin = async () => {
    if (!windowState.canJoin) {
      setShowHint(true);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/student/sessions/${sessionId}/join`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(
          STUDENT_UR.joinClass.cannotJoin,
          data.message || windowState.hint || STUDENT_UR.joinClass.tryAgain
        );
        return;
      }

      if (data.data?.roomType === "portal" && data.data?.livePath) {
        const msg =
          data.data?.attendance === "late"
            ? STUDENT_UR.joinClass.enteringLate
            : STUDENT_UR.joinClass.enteringPresent;
        toast.success(msg);
        router.push(data.data.livePath);
        return;
      }

      if (data.data?.meetLink) {
        const msg =
          data.data?.attendance === "late"
            ? STUDENT_UR.joinClass.openingLate
            : STUDENT_UR.joinClass.openingPresent;
        toast.success(msg);
        window.location.assign(data.data.meetLink);
        return;
      }

      toast.error(STUDENT_UR.joinClass.linkNotAvailable);
    } catch {
      toast.error(STUDENT_UR.joinClass.error);
    } finally {
      setLoading(false);
    }
  };

  const isOpen = windowState.phase === "open";
  const isDone = windowState.phase === "ended";

  return (
    <div
      className={cn("relative shrink-0", className)}
      onMouseEnter={() => !isOpen && !isDone && setShowHint(true)}
      onMouseLeave={() => setShowHint(false)}
    >
      <Button
        type="button"
        size={size}
        variant={isDone ? "secondary" : isOpen ? "default" : "outline"}
        className={cn(
          "h-14 text-base gap-2",
          !isOpen && !isDone && "opacity-90"
        )}
        onClick={handleJoin}
        disabled={loading || isDone}
        aria-disabled={!isOpen}
      >
        <VideoCamera size={22} weight="duotone" />
        {loading ? "Joining..." : windowState.buttonLabel}
      </Button>

      {!isOpen && !isDone && showHint && (
        <div
          role="tooltip"
          className="absolute right-0 bottom-full z-20 mb-2 w-[min(100vw-2rem,280px)] rounded-xl border border-border bg-background p-3 text-left shadow-lg"
        >
          <p className="flex items-start gap-2 text-xs text-muted leading-relaxed">
            <Info size={16} weight="fill" className="shrink-0 text-primary mt-0.5" />
            <span>{windowState.hint}</span>
          </p>
        </div>
      )}
    </div>
  );
}
