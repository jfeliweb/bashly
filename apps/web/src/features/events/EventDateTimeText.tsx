'use client';

import { useLocale } from 'next-intl';

import {
  formatLocalDate,
  formatLocalDateTime,
  formatLocalTime,
} from '@/features/events/event-date-time';

type EventDateTimeTextProps = {
  value: Date | string | null | undefined;
  mode?: 'date' | 'time' | 'dateTime';
  fallback?: string;
};

export function EventDateTimeText({
  value,
  mode = 'dateTime',
  fallback = '',
}: EventDateTimeTextProps) {
  const locale = useLocale();

  const text = mode === 'date'
    ? formatLocalDate(value, locale)
    : mode === 'time'
      ? formatLocalTime(value, locale)
      : formatLocalDateTime(value, locale);

  return <span suppressHydrationWarning>{text || fallback}</span>;
}
