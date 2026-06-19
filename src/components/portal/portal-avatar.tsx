"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface PortalAvatarProps {
  name: string;
  avatarUrl?: string;
  avatarInitials?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
};

export function PortalAvatar({
  name,
  avatarUrl,
  avatarInitials,
  className,
  size = "md",
}: PortalAvatarProps) {
  const initials =
    avatarInitials ??
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  if (avatarUrl) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-full bg-white/20 shrink-0",
          sizeClasses[size],
          className
        )}
      >
        <Image src={avatarUrl} alt={`${name} profile photo`} fill className="object-cover" unoptimized />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-white/20 flex items-center justify-center font-bold shrink-0",
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
