"use client";

import { useEffect, useState } from "react";
import { WifiSlash, CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    // Check initial state
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !showRestored) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-3 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[92%] sm:w-auto px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-center gap-2.5 text-xs font-bold transition-all duration-300 animate-in slide-in-from-top-4",
        isOffline
          ? "bg-red-600/95 text-white border border-red-500/50 ring-4 ring-red-500/20"
          : "bg-emerald-600/95 text-white border border-emerald-500/50 ring-4 ring-emerald-500/20"
      )}
      role="alert"
      aria-live="assertive"
    >
      {isOffline ? (
        <>
          <WifiSlash size={18} weight="bold" className="animate-bounce shrink-0" />
          <span className="truncate">You are currently offline. Check your internet connection.</span>
        </>
      ) : (
        <>
          <CheckCircle size={18} weight="fill" className="shrink-0" />
          <span className="truncate">Connection restored! You are back online.</span>
        </>
      )}
    </div>
  );
}
