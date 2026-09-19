"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RootError({
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
    console.error("Root page error caught by error boundary:", error);

    // Auto-reload once if a ChunkLoadError happened from a newly deployed release
    if (isChunkError) {
      const key = "eest_root_chunk_retry";
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
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className={`p-4 rounded-full mb-6 ${isChunkError ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}`}>
        <AlertTriangle size={40} />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
        {isChunkError ? "Portal Update Available" : "Something went wrong"}
      </h1>

      <p className="text-slate-600 max-w-md mb-8 text-sm leading-relaxed">
        {isChunkError
          ? "A new version of the portal was deployed. Please reload the page to get the latest features."
          : "An unexpected error occurred while loading this page. You can try refreshing the page or return home."}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={handleRetry} className="gap-2 font-bold">
          <RefreshCw size={16} />
          {isChunkError ? "Reload Latest Version" : "Try Again"}
        </Button>

        <Button variant="outline" asChild className="gap-2 font-bold">
          <Link href="/">
            <Home size={16} />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
