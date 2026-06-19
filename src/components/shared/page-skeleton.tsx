import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-muted/80", className)}
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
    <div>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <Skeleton className="h-8 w-48 mb-6 rounded-full" />
        <Skeleton className="h-12 w-full max-w-2xl mb-4" />
        <Skeleton className="h-12 w-full max-w-xl mb-6" />
        <Skeleton className="h-5 w-full max-w-lg mb-10" />
        <div className="flex gap-3">
          <Skeleton className="h-14 w-44 rounded-lg" />
          <Skeleton className="h-14 w-36 rounded-lg" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function PortalPageSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>
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
