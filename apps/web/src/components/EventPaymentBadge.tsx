import { Sparkles } from 'lucide-react';

type EventPaymentBadgeProps = {
  paymentStatus: string | null | undefined;
  label: string;
  freeLabel?: string;
  showFree?: boolean;
};

export function EventPaymentBadge({
  paymentStatus,
  label,
  freeLabel,
  showFree = false,
}: EventPaymentBadgeProps) {
  if (paymentStatus === 'paid') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(48,153,0)] bg-[rgb(238,255,229)] px-2.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider text-[rgb(48,153,0)] dark:border-[rgb(116,255,51)] dark:bg-[rgb(116,255,51)]/10 dark:text-[rgb(116,255,51)]"
        aria-label={label}
      >
        <Sparkles className="size-3.5 shrink-0" aria-hidden />
        {label}
      </span>
    );
  }

  if (showFree && freeLabel) {
    return (
      <span
        className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        aria-label={freeLabel}
      >
        {freeLabel}
      </span>
    );
  }

  return null;
}
