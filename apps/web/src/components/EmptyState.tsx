import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  const hasAction = actionLabel && (onAction || actionHref);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 inline-flex items-center justify-center rounded-full bg-cerulean-100 p-4 dark:bg-cerulean-900">
        <Icon className="h-8 w-8 text-cerulean-600 dark:text-cerulean-400" aria-hidden />
      </div>
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-muted-foreground">{description}</p>
      {hasAction && actionHref && (
        <Button
          asChild
          className="mt-6 min-h-[44px] rounded-[100px] bg-fern-500 font-bold text-cerulean-950 hover:bg-fern-600 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
          size="lg"
        >
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
      {hasAction && onAction && !actionHref && (
        <Button
          onClick={onAction}
          className="mt-6 min-h-[44px] rounded-[100px] bg-fern-500 font-bold text-cerulean-950 hover:bg-fern-600 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
          size="lg"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
