import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

function Bone({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-zinc-200/60", className)} style={style} />
  );
}

const SHELL =
  "flex h-[calc(100dvh-3.5rem-2.5rem)] max-h-[calc(100dvh-3.5rem-2.5rem)] flex-col gap-2 min-h-0 overflow-hidden";

export function AdminDashboardSkeleton() {
  return (
    <div className={SHELL}>
      <Bone className="h-14 rounded-xl shrink-0" />

      <div className="shrink-0 grid grid-cols-2 xl:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-[4.25rem] rounded-xl" />
        ))}
      </div>

      <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-2">
        <Bone className="h-24 rounded-xl" />
        <Bone className="h-24 rounded-xl" />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-2">
        <Bone className="lg:col-span-3 rounded-xl" />
        <Bone className="lg:col-span-2 rounded-xl bg-zinc-300/40" />
      </div>
    </div>
  );
}
