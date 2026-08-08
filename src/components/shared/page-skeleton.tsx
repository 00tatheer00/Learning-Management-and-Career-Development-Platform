import { cn } from "@/lib/utils";
import { DynamicProgressBar } from "@/components/ui/dynamic-progress-bar";

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
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="max-w-md mx-auto">
        <DynamicProgressBar title="Loading Page..." size="sm" variant="gradient" />
      </div>
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
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 pt-24 pb-16 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      <div className="w-full max-w-sm">
        <DynamicProgressBar title="Loading Home..." size="sm" variant="gradient" />
      </div>
      <Skeleton className="h-8 w-48 rounded-full" />
      <Skeleton className="h-12 w-full max-w-2xl rounded-xl" />
      <Skeleton className="h-5 w-full max-w-lg rounded-lg" />
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-12 w-40 rounded-xl" />
        <Skeleton className="h-12 w-32 rounded-xl" />
      </div>
    </div>
  );
}

export function PortalPageSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Top Dynamic Progress Header */}
      <div className="bg-background/80 dark:bg-slate-900/80 border border-border/60 rounded-2xl p-4 shadow-sm max-w-xl">
        <DynamicProgressBar
          title="Loading Portal Workspace..."
          subtitle="Fetching your active modules and dashboard content"
          size="md"
          variant="gradient"
        />
      </div>

      <div className="space-y-2 pt-2">
        <Skeleton className="h-7 w-48 rounded-xl" />
        <Skeleton className="h-4 w-72 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-52 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-52 rounded-2xl" />
      </div>
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-3xl mx-auto space-y-6">
      <div className="max-w-sm">
        <DynamicProgressBar title="Loading Form..." size="sm" variant="gradient" />
      </div>
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
