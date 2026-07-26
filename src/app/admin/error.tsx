"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin portal error caught:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-600 mb-5">
        <ShieldAlert size={36} />
      </div>

      <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
        Admin Portal Error
      </h2>

      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        An error occurred in the administrative panel. Please check logs or reload.
      </p>

      <div className="flex items-center gap-3">
        <Button onClick={() => reset()} size="sm" className="gap-2 font-bold">
          <RefreshCw size={14} />
          Retry Request
        </Button>

        <Button variant="outline" size="sm" asChild className="gap-2 font-bold">
          <Link href="/admin">
            Admin Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
