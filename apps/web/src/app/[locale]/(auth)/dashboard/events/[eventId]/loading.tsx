function Bone({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className ?? ''}`}
    />
  );
}

export default function EventDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Header skeleton */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Bone className="h-4 w-20" />
            <Bone className="h-5 w-16 rounded-full" />
          </div>
          <Bone className="h-8 w-64" />
          <Bone className="h-4 w-48" />
        </div>
        <div className="flex shrink-0 gap-2">
          <Bone className="h-11 w-36 rounded-lg" />
          <Bone className="h-11 w-28 rounded-[100px]" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`stat-${i.toString()}`}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <Bone className="h-3 w-16" />
            <Bone className="mt-2 h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <Bone className="h-3 w-28" />
          <div className="mt-4 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`detail-${i.toString()}`}>
                <Bone className="h-3 w-20" />
                <Bone className="mt-1 h-5 w-40" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <Bone className="h-3 w-20" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`feature-${i.toString()}`}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <Bone className="h-4 w-28" />
                <Bone className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
