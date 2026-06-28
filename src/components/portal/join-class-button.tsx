"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VideoCamera } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";

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
  label = "Join Class",
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
          "Cannot join class",
          data.message || "Try again at class time."
        );
        return;
      }

      const attendanceLabel =
        data.data?.attendance === "late" ? "marked late" : "marked present";

      if (data.data?.roomType === "portal" && data.data?.livePath) {
        toast.success(`Entering class — ${attendanceLabel}`);
        router.push(data.data.livePath);
        return;
      }

      if (data.data?.meetLink) {
        toast.success(`Opening class — ${attendanceLabel}`);
        window.open(data.data.meetLink, "_blank", "noopener,noreferrer");
        return;
      }

      toast.error("Class link not available");
    } catch {
      toast.error("Could not join class. Please try again.");
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
        {loading ? "Joining..." : label}
      </Button>
    </div>
  );
}
