"use client";

import { useCallback, useEffect, useState } from "react";
import { StudentWelcomeCelebration } from "@/components/portal/student-welcome-celebration";
import type { PendingPortalWelcome } from "@/lib/api/student-portal-welcome";

interface StudentPortalWelcomeProps {
  studentId: string;
  studentName: string;
}

export function StudentPortalWelcome({ studentId, studentName }: StudentPortalWelcomeProps) {
  const [phase, setPhase] = useState<"loading" | "celebration" | "done">("loading");
  const [pendingWelcome, setPendingWelcome] = useState<PendingPortalWelcome | null>(null);

  const loadWelcomeState = useCallback(async () => {
    try {
      const res = await fetch("/api/student/welcome", { cache: "no-store" });
      const json = await res.json();
      const pending = (json.data?.pending as PendingPortalWelcome | null | undefined) ?? null;

      if (pending) {
        setPendingWelcome(pending);
        setPhase("celebration");
        return;
      }

      setPhase("done");
    } catch {
      setPhase("done");
    }
  }, []);

  useEffect(() => {
    void loadWelcomeState();
  }, [loadWelcomeState, studentId]);

  const handleCelebrationComplete = async () => {
    if (pendingWelcome) {
      try {
        await fetch("/api/student/welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrollmentId: pendingWelcome.enrollmentId }),
        });
      } catch {
        // ignore network errors — student can still continue
      }
    }

    setPhase("done");
  };

  if (phase === "loading") return null;

  if (phase === "celebration") {
    return (
      <StudentWelcomeCelebration
        studentName={studentName}
        moduleName={pendingWelcome?.moduleName}
        courseTitle={pendingWelcome?.courseTitle}
        onComplete={() => void handleCelebrationComplete()}
      />
    );
  }

  return null;
}
