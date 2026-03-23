'use client';

import { useEffect, useState } from 'react';

import { isSameCalendarDay } from '@/features/events/event-date-time';
import { EventDateTimeText } from '@/features/events/EventDateTimeText';

type EventTimeRangeTextProps = {
  startValue: Date | string | null | undefined;
  endValue: Date | string | null | undefined;
  fallback?: string;
};

export function EventTimeRangeText({
  startValue,
  endValue,
  fallback = '',
}: EventTimeRangeTextProps) {
  const [viewerTimeZone, setViewerTimeZone] = useState<string | null>(null);

  useEffect(() => {
    const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setViewerTimeZone(resolved || null);
  }, []);

  if (!startValue) {
    return <>{fallback}</>;
  }

  if (!endValue) {
    return <EventDateTimeText value={startValue} mode="time" fallback={fallback} timeZone="viewer" />;
  }

  const sameDay = viewerTimeZone
    ? isSameCalendarDay(startValue, endValue, { timeZone: viewerTimeZone })
    : false;

  return (
    <>
      <EventDateTimeText value={startValue} mode="time" fallback={fallback} timeZone="viewer" />
      {' - '}
      <EventDateTimeText
        value={endValue}
        mode={sameDay ? 'time' : 'dateTime'}
        fallback={fallback}
        timeZone="viewer"
      />
    </>
  );
}
