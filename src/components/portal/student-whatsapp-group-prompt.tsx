"use client";

import { useEffect, useState } from "react";
import { WhatsappLogo, ChatsCircle, CheckCircle } from "@phosphor-icons/react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  STUDENT_WHATSAPP_GROUP_NAME,
  STUDENT_WHATSAPP_GROUP_URL,
} from "@/lib/constants/contact";

const JOINED_KEY = "eest-whatsapp-group-joined";
const DEFERRED_KEY = "eest-whatsapp-group-deferred";

export function StudentWhatsAppGroupPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(JOINED_KEY) === "true") return;
      if (sessionStorage.getItem(DEFERRED_KEY) === "true") return;
      setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const handleJoin = () => {
    try {
      localStorage.setItem(JOINED_KEY, "true");
      sessionStorage.removeItem(DEFERRED_KEY);
    } catch {
      // ignore storage errors
    }
    setOpen(false);
    window.open(STUDENT_WHATSAPP_GROUP_URL, "_blank", "noopener,noreferrer");
  };

  const handleLater = () => {
    try {
      sessionStorage.setItem(DEFERRED_KEY, "true");
    } catch {
      // ignore storage errors
    }
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={handleLater} title="Welcome to your portal!">
      <div className="text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white mb-4">
          <WhatsappLogo size={36} weight="fill" />
        </div>

        <p className="text-muted leading-relaxed mb-5">
          Your registration is approved. Join{" "}
          <strong className="text-foreground">{STUDENT_WHATSAPP_GROUP_NAME}</strong> now to get
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

/** Call after a successful student login so the prompt shows again this session. */
export function resetWhatsAppGroupPromptForLogin() {
  try {
    sessionStorage.removeItem(DEFERRED_KEY);
  } catch {
    // ignore storage errors
  }
}
