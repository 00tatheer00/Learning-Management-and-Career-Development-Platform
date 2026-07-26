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
  useEffect(() => {
    console.error("Root page error caught by error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="p-4 rounded-full bg-red-500/10 text-red-600 mb-6">
        <AlertTriangle size={40} />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
        Something went wrong
      </h1>

      <p className="text-slate-600 max-w-md mb-8 text-sm leading-relaxed">
        An unexpected error occurred while loading this page. You can try refreshing the page or return home.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} className="gap-2 font-bold">
          <RefreshCw size={16} />
          Try Again
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
