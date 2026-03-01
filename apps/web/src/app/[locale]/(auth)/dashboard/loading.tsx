import { EventCardSkeleton, StatsCardSkeleton } from '@/components/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-7 w-40 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="mt-3 h-11 w-40 animate-pulse rounded-[100px] bg-muted sm:mt-0" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={`stats-skeleton-${i.toString()}`} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={`quick-action-skeleton-${i.toString()}`}
            className="rounded-lg border border-cerulean-200 p-4 dark:border-cerulean-800"
          >
            <div className="flex items-start gap-3">
              <div className="size-8 animate-pulse rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
                <div className="h-3 w-40 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <EventCardSkeleton key={`event-card-skeleton-${i.toString()}`} />
        ))}
      </div>
    </div>
  );
}
