'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

export type ScheduleItem = {
  id: string;
  startTime: string;
  title: string;
  note: string | null;
};

type ScheduleListProps = {
  items: ScheduleItem[];
  /** Max items to show before "Show all" (e.g. 4) */
  initialVisible?: number;
};

export function ScheduleList({
  items,
  initialVisible = 4,
}: ScheduleListProps) {
  const t = useTranslations('GuestEvent');
  const [showAll, setShowAll] = useState(false);
  const hasMore = items.length > initialVisible;
  const visibleItems = hasMore && !showAll ? items.slice(0, initialVisible) : items;

  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <ol className="flex flex-col gap-0">
        {visibleItems.map((item, index) => (
          <li
            key={item.id}
            className="flex gap-3"
            style={{ listStyle: 'none' }}
          >
            <div className="w-12 shrink-0 pt-0.5 text-right">
              <span className="font-mono text-xs font-semibold text-[var(--theme-primary)]">
                {item.startTime}
              </span>
            </div>
            <div className="flex shrink-0 flex-col items-center pt-1">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: 'var(--theme-primary)' }}
                aria-hidden
              />
              {index < visibleItems.length - 1 && (
                <span
                  className="mt-0.5 w-0.5 flex-1"
                  style={{ backgroundColor: 'var(--theme-border)', minHeight: 24 }}
                  aria-hidden
                />
              )}
            </div>
            <div className="flex-1 pb-4">
              <span className="font-nunito text-sm font-bold text-[var(--theme-text)]">
                {item.title}
              </span>
              {item.note && (
                <p className="mt-0.5 font-nunito text-xs text-[var(--theme-text-muted)]">
                  {item.note}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      {hasMore && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--theme-primary)] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary-dark)]"
          aria-expanded="false"
          aria-label={t('show_all_schedule')}
        >
          {t('show_all')}
        </button>
      )}
    </div>
  );
}
