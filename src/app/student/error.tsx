"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Student portal error caught:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 mb-5">
        <AlertTriangle size={36} />
      </div>

      <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
        Student Portal Error
      </h2>

      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        Could not load student dashboard data. Please check your internet connection or try again.
      </p>

      <div className="flex items-center gap-3">
        <Button onClick={() => reset()} size="sm" className="gap-2 font-bold">
          <RefreshCw size={14} />
          Reload Section
        </Button>

        <Button variant="outline" size="sm" asChild className="gap-2 font-bold">
          <Link href="/student">
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
