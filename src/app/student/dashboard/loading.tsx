import {
  PortalStatCardSkeleton,
  PortalClassCardSkeleton,
  PortalAssignmentCardSkeleton,
} from "@/components/portal/portal-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header date and title skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-4 w-44 rounded-md" />
      </div>

      {/* Hero Banner Skeleton */}
      <div className="rounded-3xl border border-pt-subtle bg-pt-surface p-6 sm:p-8 space-y-4 shadow-pt">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-4 w-80 max-w-full rounded-md" />
          </div>
          <Skeleton className="h-12 w-36 rounded-2xl" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <PortalStatCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Grid: Next class & Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PortalClassCardSkeleton />
          <PortalAssignmentCardSkeleton />
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-pt-subtle bg-pt-surface p-5 shadow-pt space-y-3">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
