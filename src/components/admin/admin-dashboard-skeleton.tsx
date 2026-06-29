import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

function Bone({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={cn("animate-pulse rounded-xl portal-skeleton", className)} style={style} />
  );
}

const SHELL = "flex flex-col gap-4 pb-4";

export function AdminDashboardSkeleton() {
  return (
    <div className={SHELL}>
      <Bone className="h-16 shrink-0 rounded-none border-b border-pt-subtle" />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-[7.5rem]" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Bone className="h-28" />
        <Bone className="h-28" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Bone className="lg:col-span-3 h-72" />
        <Bone className="lg:col-span-2 h-72" />
      </div>
    </div>
  );
}
