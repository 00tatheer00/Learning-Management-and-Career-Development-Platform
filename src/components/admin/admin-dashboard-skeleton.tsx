import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

function Bone({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-zinc-100", className)} style={style} />
  );
}

const SHELL =
  "flex h-[calc(100dvh-3.5rem-2.5rem)] max-h-[calc(100dvh-3.5rem-2.5rem)] flex-col gap-3 min-h-0 overflow-hidden";

export function AdminDashboardSkeleton() {
  return (
    <div className={SHELL}>
      <Bone className="h-16 shrink-0 rounded-none border-b border-zinc-100" />

      <div className="shrink-0 grid grid-cols-2 xl:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-[7.5rem]" />
        ))}
      </div>

      <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-3">
        <Bone className="h-28" />
        <Bone className="h-28" />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-3">
        <Bone className="lg:col-span-3" />
        <Bone className="lg:col-span-2" />
      </div>
    </div>
  );
}
