'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

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

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[520px] px-4 pb-6">
      <h2 className="mb-4 font-bricolage text-lg font-extrabold text-[var(--theme-text)]">
        {t('schedule_heading')}
      </h2>
      <ol className="flex flex-col gap-0">
        {visibleItems.map((item, index) => (
          <li
            key={item.id}
            className="flex gap-4"
            style={{ listStyle: 'none' }}
          >
            <div className="w-14 flex-shrink-0 text-right">
              <span className="font-mono text-xs font-semibold text-[var(--theme-primary)]">
                {item.startTime}
              </span>
            </div>
            <div className="flex flex-shrink-0 flex-col items-center pt-1">
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
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
            <div className="flex-1 pb-5">
              <span className="font-nunito text-sm font-semibold text-[var(--theme-text)]">
                {item.title}
              </span>
              {item.note && (
                <p className="font-nunito text-xs text-[var(--theme-text-muted)] mt-0.5">
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
    </section>
  );
}
