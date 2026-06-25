import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

function Bone({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={cn("animate-pulse rounded-lg bg-zinc-200/70", className)} style={style} />;
}

export function AdminDashboardSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-2.5rem)] max-h-[calc(100dvh-3.5rem-2.5rem)] overflow-hidden gap-3">
      <div className="shrink-0 flex items-end justify-between gap-3">
        <div className="space-y-2">
          <Bone className="h-3 w-16" />
          <Bone className="h-8 w-40" />
        </div>
        <Bone className="h-9 w-28 rounded-xl" />
      </div>

      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-100 bg-white p-3.5">
            <div className="flex items-center gap-3">
              <Bone className="h-11 w-11 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Bone className="h-3 w-20" />
                <Bone className="h-7 w-16" />
              </div>
            </div>
            <Bone className="h-2.5 w-28 mt-3" />
          </div>
        ))}
      </div>

      <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-100 bg-white p-5">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Bone className="h-8 w-28" />
                <Bone className="h-3.5 w-24" />
              </div>
              <Bone className="h-11 w-11 rounded-xl" />
            </div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-zinc-100">
              <Bone className="h-3 w-32" />
              <Bone className="h-3 w-10" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-100 bg-white p-4">
          <Bone className="h-5 w-40 mb-3" />
          <div className="flex items-center gap-4 py-2">
            <Bone className="h-28 w-28 rounded-full shrink-0" />
            <div className="flex-1 space-y-3">
              <Bone className="h-5 w-full" />
              <Bone className="h-5 w-3/4" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-auto pt-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Bone key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-100 bg-white p-4">
          <Bone className="h-3.5 w-28 mb-3" />
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Bone key={i} className="h-[4.5rem] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
