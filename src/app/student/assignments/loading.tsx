import { PortalAssignmentCardSkeleton } from "@/components/portal/portal-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentAssignmentsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-44 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PortalAssignmentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
