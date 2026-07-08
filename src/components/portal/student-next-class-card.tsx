"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarBlank, Clock, VideoCamera } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { JoinClassButton } from "@/components/portal/join-class-button";
import {
  getSessionCountdownParts,
  parseSessionDateTime,
} from "@/lib/utils/session-datetime";
import { getSessionLifecycleState } from "@/lib/sessions/join-window";
import { cn } from "@/lib/utils";

interface StudentNextClassCardProps {
  session: {
    id: string;
    title: string;
    date: string;
    time: string;
    trainerName: string;
    notes?: string;
    hasJoinLink?: boolean;
  };
  canJoinLive?: boolean;
  programSlug: string;
  studentModule?: string | null;
}

export function StudentNextClassCard({
  session,
  canJoinLive = true,
  programSlug,
  studentModule,
}: StudentNextClassCardProps) {
  const [now, setNow] = useState(() => new Date());
  const sessionAt = parseSessionDateTime(session.date, session.time);
  const [countdown, setCountdown] = useState(() =>
    sessionAt ? getSessionCountdownParts(sessionAt) : null
  );

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

  useEffect(() => {
    const at = parseSessionDateTime(session.date, session.time);
    if (!at) return;
    const tick = () => setCountdown(getSessionCountdownParts(at));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [session.date, session.time]);

  const isLive = lifecycle.phase === "live";

  return (
    <div
      className={cn(
        "portal-card student-glass-card rounded-2xl p-5 sm:p-6",
        isLive || countdown?.isSoon
          ? "ring-1 ring-primary/25"
          : ""
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-primary uppercase tracking-[0.14em] mb-2 flex items-center gap-2 flex-wrap">
            <VideoCamera size={18} weight="duotone" />
            {isLive ? "Live Class Now" : "Next Live Class"}
            <span
              className={cn(
                "text-[10px] font-bold uppercase rounded-full px-2.5 py-0.5 normal-case tracking-normal",
                lifecycle.badgeClassName,
                isLive && "border-primary/40 text-primary"
              )}
            >
              {lifecycle.badgeLabel}
            </span>
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-pt mb-2">{session.title}</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-pt-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarBlank size={16} weight="duotone" className="text-primary" />
              {session.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={16} weight="duotone" className="text-primary" />
              {session.time}
            </span>
            <span>Trainer: {session.trainerName}</span>
          </div>
          {session.notes && (
            <p className="mt-3 text-sm text-pt-muted rounded-xl border border-pt bg-pt-muted/50 p-3">
              {session.notes}
            </p>
          )}
        </div>

        <div className="flex flex-col items-stretch sm:items-end gap-3 shrink-0">
          {countdown && !isLive && (
            <div
              className={cn(
                "rounded-2xl px-5 py-4 text-center w-full sm:min-w-[168px]",
                countdown.isSoon
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-pt-muted border border-pt"
              )}
            >
              <p
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.14em]",
                  countdown.isSoon ? "text-slate-200" : "text-pt-faint"
                )}
              >
                Starts in
              </p>
              <p
                className={cn(
                  "text-2xl sm:text-3xl font-bold mt-1 tabular-nums",
                  countdown.isSoon ? "text-white" : "text-pt"
                )}
              >
                {countdown.label}
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 justify-end">
            {canJoinLive ? (
              <JoinClassButton
                sessionId={session.id}
                sessionDate={session.date}
                sessionTime={session.time}
                programSlug={programSlug}
                hasJoinLink={session.hasJoinLink}
              />
            ) : (
              <div className="portal-tone-indigo rounded-xl px-4 py-3 text-sm text-center min-w-[200px]">
                <p className="font-semibold text-pt">Your module starts next month</p>
                <p className="mt-1 text-xs text-pt-muted">
                  {studentModule ? `Registered: ${studentModule}` : "Module 1 is live now"}
                </p>
              </div>
            )}
            <Button variant="outline" size="sm" asChild className="border-pt">
              <Link href="/student/classes">All classes</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
