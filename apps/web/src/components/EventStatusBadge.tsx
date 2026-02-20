import { cn } from '@/utils/Helpers';

export type EventStatus = 'draft' | 'published' | 'completed' | 'cancelled' | 'past';

type EventStatusBadgeProps = {
  status: EventStatus;
  label: string;
  showPulse?: boolean;
};

const STATUS_CLASSNAMES: Record<EventStatus, string> = {
  draft:
    'border-border bg-muted text-muted-foreground',
  published:
    'border-[rgb(48,153,0)] bg-[rgb(238,255,229)] text-[rgb(48,153,0)] dark:border-[rgb(116,255,51)] dark:bg-[rgb(116,255,51)]/10 dark:text-[rgb(116,255,51)]',
  completed:
    'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-400/10 dark:text-blue-300',
  cancelled:
    'border-destructive/50 bg-destructive/10 text-destructive',
  past:
    'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
};

export function EventStatusBadge({
  status,
  label,
  showPulse = false,
}: EventStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold',
        STATUS_CLASSNAMES[status],
      )}
    >
      {showPulse && (
        <span
          className="mr-1.5 size-1.5 rounded-full bg-current motion-safe:animate-pulse"
          aria-hidden
        />
      )}
      {label}
    </span>
  );
}

