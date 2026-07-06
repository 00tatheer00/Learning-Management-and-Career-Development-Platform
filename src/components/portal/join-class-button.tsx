"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VideoCamera } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";

interface JoinClassButtonProps {
  sessionId: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
}

export function JoinClassButton({
  sessionId,
  className,
  size = "lg",
  label = STUDENT_UR.classes.joinClass,
}: JoinClassButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/student/sessions/${sessionId}/join`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(
          STUDENT_UR.joinClass.cannotJoin,
          data.message || STUDENT_UR.joinClass.tryAgain
        );
        return;
      }

      if (data.data?.roomType === "portal" && data.data?.livePath) {
        const msg =
          data.data?.attendance === "late"
            ? STUDENT_UR.joinClass.enteringLate
            : STUDENT_UR.joinClass.enteringPresent;
        toast.success(msg);
        router.push(data.data.livePath);
        return;
      }

      if (data.data?.meetLink) {
        const msg =
          data.data?.attendance === "late"
            ? STUDENT_UR.joinClass.openingLate
            : STUDENT_UR.joinClass.openingPresent;
        toast.success(msg);
        window.open(data.data.meetLink, "_blank", "noopener,noreferrer");
        return;
      }

      toast.error(STUDENT_UR.joinClass.linkNotAvailable);
    } catch {
      toast.error(STUDENT_UR.joinClass.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("shrink-0", className)}>
      <Button
        type="button"
        size={size}
        className="h-14 text-base gap-2"
        onClick={handleJoin}
        disabled={loading}
      >
        <VideoCamera size={22} weight="duotone" />
        {loading ? STUDENT_UR.classes.joining : label}
      </Button>
    </div>
  );
}
