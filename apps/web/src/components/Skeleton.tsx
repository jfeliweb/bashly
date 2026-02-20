import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/Helpers';

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="rounded-lg border border-cerulean-200 p-6 dark:border-cerulean-800">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-8 w-16" />
          <Skeleton className="mt-1 h-3 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="rounded-lg border border-cerulean-200 p-6 dark:border-cerulean-800">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-4 flex items-center gap-6">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

