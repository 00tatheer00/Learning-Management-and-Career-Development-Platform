"use client";

import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "@/lib/ui/toast";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";

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
        toast.info(STUDENT_UR.singleSession.loggedOut, STUDENT_UR.singleSession.otherDevice);
      }
      void signOut({ callbackUrl: "/login?reason=session-replaced" });
    }
  }, [session, status]);

  return null;
}
