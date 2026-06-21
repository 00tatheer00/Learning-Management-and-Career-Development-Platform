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

const JOINED_KEY = "eest-whatsapp-group-joined";
const DEFERRED_KEY = "eest-whatsapp-group-deferred";

interface StudentPortalWelcomeProps {
  studentName: string;
}

export function StudentPortalWelcome({ studentName }: StudentPortalWelcomeProps) {
  const [phase, setPhase] = useState<"celebration" | "whatsapp" | "done">("done");

  useEffect(() => {
    if (shouldShowStudentCelebration()) {
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
  }, []);

  if (phase === "celebration") {
    return (
      <StudentWelcomeCelebration
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
    <Modal open={open} onClose={handleLater} title="Join your class WhatsApp group">
      <div className="text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white mb-4">
          <WhatsappLogo size={36} weight="fill" />
        </div>

        <p className="text-muted leading-relaxed mb-5">
          Join <strong className="text-foreground">{STUDENT_WHATSAPP_GROUP_NAME}</strong> now to get
          live class links, recorded lectures, and assignment updates.
        </p>

        <ul className="space-y-2.5 text-left mb-6">
          {[
            "Live class links before each session",
            "Recorded videos shared in the group",
            "Direct access to your trainer",
          ].map((item) => (
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
            Join Now — Open Group
          </Button>
          <Button variant="ghost" size="sm" className="text-muted" onClick={handleLater}>
            <ChatsCircle size={18} weight="duotone" />
            Maybe later
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

export { resetStudentWelcomeForLogin } from "@/components/portal/student-welcome-celebration";
