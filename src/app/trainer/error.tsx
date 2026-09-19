"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrainerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errMsg = (error?.message || "").toLowerCase();
  const errName = (error?.name || "").toLowerCase();
  const isChunkError =
    errName.includes("chunkloaderror") ||
    errMsg.includes("loading chunk") ||
    errMsg.includes("failed to fetch dynamically imported module") ||
    errMsg.includes("connection reset") ||
    errMsg.includes("err_http2");

  useEffect(() => {
    console.error("Trainer portal error caught:", error);
    if (isChunkError) {
      const key = "eest_trainer_chunk_retry";
      const last = sessionStorage.getItem(key);
      const now = Date.now();
      if (!last || now - parseInt(last, 10) > 10000) {
        sessionStorage.setItem(key, now.toString());
        window.location.reload();
      }
    }
  }, [error, isChunkError]);

  const handleRetry = () => {
    if (isChunkError) {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 mb-5">
        <AlertTriangle size={36} />
      </div>

      <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
        {isChunkError ? "Portal Update Available" : "Trainer Portal Error"}
      </h2>

      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {isChunkError
          ? "A new portal update was deployed. Please reload to access your updated trainer dashboard."
          : "Could not load trainer dashboard. Please retry or navigate back to dashboard main."}
      </p>

      <div className="flex items-center gap-3">
        <Button onClick={handleRetry} size="sm" className="gap-2 font-bold">
          <RefreshCw size={14} />
          {isChunkError ? "Reload Portal" : "Retry"}
        </Button>

        <Button variant="outline" size="sm" asChild className="gap-2 font-bold">
          <Link href="/trainer">
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
