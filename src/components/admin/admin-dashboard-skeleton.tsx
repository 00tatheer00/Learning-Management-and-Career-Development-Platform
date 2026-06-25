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
          <Bone className="h-7 w-40" />
        </div>
        <Bone className="h-8 w-28 rounded-xl" />
      </div>

      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-100 bg-white p-3">
            <div className="flex items-center gap-2.5">
              <Bone className="h-9 w-9 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Bone className="h-2.5 w-20" />
                <Bone className="h-6 w-14" />
              </div>
            </div>
            <Bone className="h-2 w-24 mt-2.5" />
          </div>
        ))}
      </div>

      <div className="shrink-0 grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-100 bg-white p-3.5">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Bone className="h-7 w-24" />
                <Bone className="h-3 w-20" />
              </div>
              <Bone className="h-8 w-8 rounded-lg" />
            </div>
            <div className="flex justify-between items-center mt-4">
              <Bone className="h-3 w-28" />
              <Bone className="h-3 w-10" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-2.5">
        <div className="lg:col-span-3 rounded-xl border border-zinc-100 bg-white p-3.5 flex flex-col">
          <div className="flex justify-between mb-3">
            <Bone className="h-4 w-36" />
            <Bone className="h-7 w-24 rounded-lg" />
          </div>
          <div className="flex-1 flex items-end gap-2 min-h-[120px]">
            {[40, 55, 35, 70, 45, 60, 50].map((h, i) => (
              <Bone key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 rounded-xl border border-zinc-100 bg-white p-3.5">
          <div className="flex justify-between mb-3">
            <Bone className="h-4 w-32" />
            <Bone className="h-7 w-28 rounded-lg" />
          </div>
          <div className="flex items-center gap-4">
            <Bone className="h-24 w-24 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-3/4" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Bone key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
