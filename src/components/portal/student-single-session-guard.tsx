"use client";

import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "@/lib/ui/toast";

export function StudentSingleSessionGuard() {
  const { data: session, status } = useSession();
  const signingOutRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || signingOutRef.current) return;
    if (session?.user?.role !== "student") return;

    const expired =
      session.expires && new Date(session.expires).getTime() <= Date.now();
    const replaced = Boolean(session.sessionInvalid);

    if (replaced || expired) {
      signingOutRef.current = true;
      if (replaced) {
        toast.info(
          "Logged out",
          "Your account was opened on another device. Only one device can stay logged in."
        );
      }
      void signOut({ callbackUrl: "/login?reason=session-replaced" });
    }
  }, [session, status]);

  return null;
}
