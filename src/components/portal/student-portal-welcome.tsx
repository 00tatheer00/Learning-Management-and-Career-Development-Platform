"use client";

import { useCallback, useEffect, useState } from "react";
import { WhatsappLogo, ChatsCircle, CheckCircle } from "@phosphor-icons/react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  STUDENT_WHATSAPP_GROUP_NAME,
  STUDENT_WHATSAPP_GROUP_URL,
} from "@/lib/constants/contact";
import { StudentWelcomeCelebration } from "@/components/portal/student-welcome-celebration";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";
import type { PendingPortalWelcome } from "@/lib/api/student-portal-welcome";

/** Legacy global key — still honored for existing browsers */
const LEGACY_JOINED_KEY = "eest-whatsapp-group-joined";

function joinedKey(studentId: string) {
  return `eest-wa-joined-${studentId}`;
}

function dismissedKey(studentId: string) {
  return `eest-wa-dismissed-${studentId}`;
}

function hasSeenWhatsAppGroupPrompt(studentId: string): boolean {
  try {
    return (
      localStorage.getItem(joinedKey(studentId)) === "true" ||
      localStorage.getItem(dismissedKey(studentId)) === "true" ||
      localStorage.getItem(LEGACY_JOINED_KEY) === "true"
    );
  } catch {
    return false;
  }
}

interface StudentPortalWelcomeProps {
  studentId: string;
  studentName: string;
}

export function StudentPortalWelcome({ studentId, studentName }: StudentPortalWelcomeProps) {
  const [phase, setPhase] = useState<"loading" | "celebration" | "whatsapp" | "done">("loading");
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

      // Returning login — never show WhatsApp group modal again here.
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

    if (hasSeenWhatsAppGroupPrompt(studentId)) {
      setPhase("done");
      return;
    }

    setPhase("whatsapp");
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

  if (phase === "whatsapp") {
    return (
      <StudentWhatsAppGroupPrompt studentId={studentId} onClose={() => setPhase("done")} />
    );
  }

  return null;
}

function StudentWhatsAppGroupPrompt({
  studentId,
  onClose,
}: {
  studentId: string;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(true);

  const handleJoin = () => {
    try {
      localStorage.setItem(joinedKey(studentId), "true");
    } catch {
      // ignore storage errors
    }
    setOpen(false);
    onClose();
    window.open(STUDENT_WHATSAPP_GROUP_URL, "_blank", "noopener,noreferrer");
  };

  const handleLater = () => {
    try {
      localStorage.setItem(dismissedKey(studentId), "true");
    } catch {
      // ignore storage errors
    }
    setOpen(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleLater} title={STUDENT_UR.whatsappModal.title}>
      <div className="text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary mb-4 border border-primary/30">
          <WhatsappLogo size={36} weight="fill" />
        </div>

        <p className="text-muted leading-relaxed mb-5">
          {STUDENT_UR.whatsappModal.body(STUDENT_WHATSAPP_GROUP_NAME)}
        </p>

        <ul className="space-y-2.5 text-left mb-6">
          {STUDENT_UR.whatsappModal.bullets.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <CheckCircle size={18} weight="fill" className="text-primary shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            onClick={handleJoin}
          >
            <WhatsappLogo size={20} weight="fill" />
            {STUDENT_UR.whatsappModal.joinButton}
          </Button>
          <Button variant="ghost" size="sm" className="text-muted" onClick={handleLater}>
            <ChatsCircle size={18} weight="duotone" />
            {STUDENT_UR.whatsappModal.later}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
