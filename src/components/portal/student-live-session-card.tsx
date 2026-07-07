"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarBlank, CheckCircle } from "@phosphor-icons/react";
import { JoinClassButton } from "@/components/portal/join-class-button";
import { getSessionLifecycleState } from "@/lib/sessions/join-window";
import { cn } from "@/lib/utils";

interface StudentLiveSessionCardProps {
  session: {
    id: string;
    title: string;
    date: string;
    time: string;
    trainerName: string;
    notes?: string;
    hasJoinLink?: boolean;
  };
  programSlug: string;
  canJoinLive: boolean;
}

export function StudentLiveSessionCard({
  session,
  programSlug,
  canJoinLive,
}: StudentLiveSessionCardProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const lifecycle = useMemo(
    () =>
      getSessionLifecycleState({
        sessionDate: session.date,
        sessionTime: session.time,
        programSlug,
        hasJoinLink: session.hasJoinLink,
        now,
      }),
    [session.date, session.time, session.hasJoinLink, programSlug, now]
  );

  const isDone = lifecycle.phase === "done";
  const isLive = lifecycle.phase === "live";

  return (
    <div
      className={cn(
        "rounded-2xl border-2 p-5 sm:p-6 transition-colors",
        isDone && "border-border bg-surface/40 opacity-80",
        isLive && "border-emerald-400/50 bg-emerald-50/50",
        !isDone && !isLive && "border-primary/30 bg-primary/5"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted mb-2">
            <CalendarBlank size={18} weight="duotone" />
            <span>
              {session.date} · {session.time}
            </span>
            <span
              className={cn(
                "text-[10px] font-bold uppercase rounded-full px-2 py-0.5",
                lifecycle.badgeClassName
              )}
            >
              {lifecycle.badgeLabel}
            </span>
          </div>
          <h2 className="text-xl font-bold">{session.title}</h2>
          <p className="text-muted mt-1">Trainer: {session.trainerName}</p>
          {isDone && (
            <p className="mt-2 text-sm text-muted flex items-center gap-1.5">
              <CheckCircle size={16} weight="fill" className="text-slate-500 shrink-0" />
              This class has ended. Check Class Recordings for the replay.
            </p>
          )}
          {session.notes && !isDone && (
            <p className="text-sm text-muted mt-2 bg-background rounded-lg p-3 border border-border">
              {session.notes}
            </p>
          )}
        </div>
        {canJoinLive ? (
          <JoinClassButton
            sessionId={session.id}
            sessionDate={session.date}
            sessionTime={session.time}
            programSlug={programSlug}
            hasJoinLink={session.hasJoinLink}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-indigo-300 bg-indigo-50 px-4 py-3 text-sm text-indigo-900 shrink-0 max-w-xs">
            <p className="font-semibold">Your module starts next month</p>
            <p className="mt-1 text-xs">This class is for Module 1 students only.</p>
          </div>
        )}
      </div>
    </div>
  );
}
