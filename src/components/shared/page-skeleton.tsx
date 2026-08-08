import { cn } from "@/lib/utils";
import { ModuleDataLoadingModal } from "@/components/portal/module-data-loading-modal";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md portal-skeleton bg-surface-muted/80", className)}
      {...props}
    />
  );
}

export function MarketingPageSkeleton() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-10 w-full max-w-xl mb-3" />
      <Skeleton className="h-10 w-full max-w-lg mb-6" />
      <Skeleton className="h-5 w-full max-w-2xl mb-10" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <ModuleDataLoadingModal
      isLoading={true}
      title="Loading Website..."
      subtitle="Loading latest course content"
    />
  );
}

export function PortalPageSkeleton() {
  return (
    <ModuleDataLoadingModal
      isLoading={true}
      title="Loading Page..."
      subtitle="Fetching latest portal records"
    />
  );
}


export function FormPageSkeleton() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-3xl mx-auto space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-md" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-14 w-full rounded-lg" />
    </div>
  );
}

export { Skeleton };
