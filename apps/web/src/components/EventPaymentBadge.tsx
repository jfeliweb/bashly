import { Sparkles } from 'lucide-react';

type EventPaymentBadgeProps = {
  paymentStatus: string | null | undefined;
  label: string;
};

export function EventPaymentBadge({ paymentStatus, label }: EventPaymentBadgeProps) {
  if (paymentStatus !== 'paid') {
    return null;
  }

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
