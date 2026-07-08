"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Sparkle, Trophy } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { playPortalSound } from "@/lib/ui/portal-sounds";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";

interface StudentWelcomeCelebrationProps {
  studentName: string;
  moduleName?: string;
  courseTitle?: string;
  onComplete: () => void;
}

function fireCelebrationBurst() {
  const defaults = {
    spread: 360,
    ticks: 80,
    gravity: 0.65,
    decay: 0.92,
    startVelocity: 28,
    colors: ["#ea580c", "#f97316", "#fbbf24", "#22c55e", "#3b82f6", "#a855f7"],
  };

  confetti({
    ...defaults,
    particleCount: 70,
    origin: { x: 0.5, y: 0.55 },
    scalar: 1.1,
  });

  confetti({
    ...defaults,
    particleCount: 45,
    origin: { x: 0.2, y: 0.65 },
    scalar: 0.9,
  });

  confetti({
    ...defaults,
    particleCount: 45,
    origin: { x: 0.8, y: 0.65 },
    scalar: 0.9,
  });
}

export function StudentWelcomeCelebration({
  studentName,
  moduleName,
  courseTitle,
  onComplete,
}: StudentWelcomeCelebrationProps) {
  const firstName = studentName.split(" ")[0] || studentName;
  const burstTimerRef = useRef<number | null>(null);

  const finish = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    playPortalSound("studentWelcome");
    fireCelebrationBurst();

    burstTimerRef.current = window.setInterval(fireCelebrationBurst, 900);
    const stopTimer = window.setTimeout(() => {
      if (burstTimerRef.current) window.clearInterval(burstTimerRef.current);
    }, 3200);

    return () => {
      if (burstTimerRef.current) window.clearInterval(burstTimerRef.current);
      window.clearTimeout(stopTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" aria-hidden="true" />

        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#c9a84c]/20 bg-pt-surface shadow-2xl"
        >
          <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-[#c9a84c]/10 blur-2xl" />

          <div className="relative px-6 py-8 text-center sm:px-8 sm:py-10">
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.4 }}
              className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#141416] to-[#0a0a0b] text-[#dbb85a] shadow-lg border border-[#c9a84c]/30"
            >
              <Trophy size={42} weight="fill" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#c9a84c]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#c9a84c] border border-[#c9a84c]/25">
                <Sparkle size={14} weight="fill" />
                {STUDENT_UR.celebration.badge}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {STUDENT_UR.celebration.title(firstName)}
              </h2>
              {moduleName && (
                <p className="mt-2 text-sm font-semibold text-primary">{moduleName}</p>
              )}
              <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed">
                {STUDENT_UR.celebration.body(moduleName, courseTitle)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-8"
            >
              <Button size="lg" className="w-full h-12 text-base font-bold" onClick={finish}>
                {STUDENT_UR.celebration.button}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
