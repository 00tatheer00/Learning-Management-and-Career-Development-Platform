import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { PORTAL_VIEWPORT_PANEL } from "@/lib/constants/portal-layout";

function Bone({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-zinc-200/60", className)} style={style} />
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className={cn(PORTAL_VIEWPORT_PANEL, "gap-4 sm:gap-5")}>
      <Bone className="h-32 sm:h-36 rounded-2xl sm:rounded-3xl shrink-0" />

      <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-100 bg-white p-5 space-y-4">
            <Bone className="h-12 w-12 rounded-2xl" />
            <div className="space-y-2">
              <Bone className="h-8 w-20" />
              <Bone className="h-4 w-28" />
              <Bone className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Bone className="h-44 rounded-2xl sm:rounded-3xl" />
        <Bone className="h-44 rounded-2xl sm:rounded-3xl" />
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
        <Bone className="lg:col-span-3 h-72 rounded-2xl sm:rounded-3xl" />
        <Bone className="lg:col-span-2 h-72 rounded-2xl sm:rounded-3xl bg-zinc-300/40" />
      </div>
    </div>
  );
}
