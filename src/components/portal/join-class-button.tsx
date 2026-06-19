"use client";

import { useState } from "react";
import { VideoCamera } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/student/sessions/${sessionId}/join`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Could not open class link. Try again at class time.");
        return;
      }

      window.open(data.data.meetLink, "_blank", "noopener,noreferrer");
    } catch {
      setError("Could not open class link. Please try again.");
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
        {loading ? "Opening..." : label}
      </Button>
      {error && <p className="text-xs text-red-600 mt-2 max-w-xs">{error}</p>}
    </div>
  );
}
