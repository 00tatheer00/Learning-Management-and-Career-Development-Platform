import { PortalCertificateCardSkeleton } from "@/components/portal/portal-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentCertificatesLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-52 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <PortalCertificateCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
