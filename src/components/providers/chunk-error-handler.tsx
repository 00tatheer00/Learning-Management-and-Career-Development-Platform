"use client";

import { useEffect } from "react";

/**
 * ChunkErrorHandler — Self-Healing Deployment Handler
 *
 * When a new deployment is pushed to Vercel, active browser sessions requesting
 * older hashed JavaScript chunks can encounter ChunkLoadError or ERR_CONNECTION_RESET.
 * This component catches unhandled chunk loading failures and automatically reloads
 * the page once so the user seamlessly receives the latest code bundle without getting stuck.
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    const isChunkError = (error: unknown): boolean => {
      if (!error) return false;
      const err = error as { name?: string; message?: string };
      const msg = (err.message || "").toLowerCase();
      const name = (err.name || "").toLowerCase();
      return (
        name.includes("chunkloaderror") ||
        msg.includes("loading chunk") ||
        msg.includes("failed to fetch dynamically imported module") ||
        msg.includes("err_connection_reset") ||
        msg.includes("err_http2_ping_failed")
      );
    };

    const attemptReload = () => {
      const key = "eest_chunk_reload_ts";
      const last = sessionStorage.getItem(key);
      const now = Date.now();
      // Prevent reload loops if client is completely offline (allow max 1 auto-reload per 10s)
      if (!last || now - parseInt(last, 10) > 10000) {
        sessionStorage.setItem(key, now.toString());
        window.location.reload();
      }
    };

    const handleWindowError = (event: ErrorEvent) => {
      if (isChunkError(event.error) || isChunkError(event.message)) {
        attemptReload();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkError(event.reason)) {
        attemptReload();
      }
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
