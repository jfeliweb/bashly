'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';

import {
  formatDate,
  formatDateTime,
  formatTime,
} from '@/features/events/event-date-time';

type EventDateTimeTextProps = {
  value: Date | string | null | undefined;
  mode?: 'date' | 'time' | 'dateTime';
  fallback?: string;
  timeZone?: 'viewer' | string;
};

export function EventDateTimeText({
  value,
  mode = 'dateTime',
  fallback = '',
  timeZone,
}: EventDateTimeTextProps) {
  const locale = useLocale();
  const [viewerTimeZone, setViewerTimeZone] = useState<string | null>(null);

  useEffect(() => {
    if (timeZone !== 'viewer') {
      return;
    }

    const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setViewerTimeZone(resolved || null);
  }, [timeZone]);

  const shouldWaitForViewerTimeZone = timeZone === 'viewer' && viewerTimeZone === null;
  if (shouldWaitForViewerTimeZone) {
    return <span>{fallback}</span>;
  }

  const resolvedTimeZone = timeZone === 'viewer' ? viewerTimeZone ?? undefined : timeZone;
  const text = mode === 'date'
    ? formatDate(value, locale, { timeZone: resolvedTimeZone })
    : mode === 'time'
      ? formatTime(value, locale, { timeZone: resolvedTimeZone })
      : formatDateTime(value, locale, { timeZone: resolvedTimeZone });

  return <span>{text || fallback}</span>;
}
