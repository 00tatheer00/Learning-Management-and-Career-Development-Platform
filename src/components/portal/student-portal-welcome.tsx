"use client";

import { useEffect, useState } from "react";
import { WhatsappLogo, ChatsCircle, CheckCircle } from "@phosphor-icons/react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  STUDENT_WHATSAPP_GROUP_NAME,
  STUDENT_WHATSAPP_GROUP_URL,
} from "@/lib/constants/contact";
import {
  StudentWelcomeCelebration,
  shouldShowStudentCelebration,
} from "@/components/portal/student-welcome-celebration";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";

const JOINED_KEY = "eest-whatsapp-group-joined";
const DEFERRED_KEY = "eest-whatsapp-group-deferred";

interface StudentPortalWelcomeProps {
  studentId: string;
  studentName: string;
}

export function StudentPortalWelcome({ studentId, studentName }: StudentPortalWelcomeProps) {
  const [phase, setPhase] = useState<"celebration" | "whatsapp" | "done">("done");

  useEffect(() => {
    if (shouldShowStudentCelebration(studentId)) {
      setPhase("celebration");
      return;
    }

    try {
      if (localStorage.getItem(JOINED_KEY) === "true") {
        setPhase("done");
        return;
      }
      if (sessionStorage.getItem(DEFERRED_KEY) === "true") {
        setPhase("done");
        return;
      }
      setPhase("whatsapp");
    } catch {
      setPhase("whatsapp");
    }
  }, [studentId]);

  if (phase === "celebration") {
    return (
      <StudentWelcomeCelebration
        studentId={studentId}
        studentName={studentName}
        onComplete={() => {
          try {
            if (localStorage.getItem(JOINED_KEY) === "true") {
              setPhase("done");
              return;
            }
            if (sessionStorage.getItem(DEFERRED_KEY) === "true") {
              setPhase("done");
              return;
            }
          } catch {
            // ignore storage errors
          }
          setPhase("whatsapp");
        }}
      />
    );
  }

  if (phase === "whatsapp") {
    return <StudentWhatsAppGroupPrompt onClose={() => setPhase("done")} />;
  }

  return null;
}

function StudentWhatsAppGroupPrompt({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(true);

  const handleJoin = () => {
    try {
      localStorage.setItem(JOINED_KEY, "true");
      sessionStorage.removeItem(DEFERRED_KEY);
    } catch {
      // ignore storage errors
    }
    setOpen(false);
    onClose();
    window.open(STUDENT_WHATSAPP_GROUP_URL, "_blank", "noopener,noreferrer");
  };

  const handleLater = () => {
    try {
      sessionStorage.setItem(DEFERRED_KEY, "true");
    } catch {
      // ignore storage errors
    }
    setOpen(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleLater} title={STUDENT_UR.whatsappModal.title}>
      <div className="text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white mb-4">
          <WhatsappLogo size={36} weight="fill" />
        </div>

        <p className="text-muted leading-relaxed mb-5">
          {STUDENT_UR.whatsappModal.body(STUDENT_WHATSAPP_GROUP_NAME)}
        </p>

        <ul className="space-y-2.5 text-left mb-6">
          {STUDENT_UR.whatsappModal.bullets.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <CheckCircle size={18} weight="fill" className="text-[#25D366] shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full h-12 text-base bg-[#25D366] hover:bg-[#20bd5a]"
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

/** Call after a successful student login so welcome flow shows again this session. */
export function resetWhatsAppGroupPromptForLogin() {
  try {
    sessionStorage.removeItem(DEFERRED_KEY);
  } catch {
    // ignore storage errors
  }
}
