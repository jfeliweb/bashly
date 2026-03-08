'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { formatLocalDateTime } from '@/features/events/event-date-time';

type CountdownTimerProps = {
  eventDate: Date | null;
  /** When true, use light text (for dark strip background) */
  inverted?: boolean;
};

function diff(until: Date): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const ms = until.getTime() - now.getTime();
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60_000) % 60;
  const h = Math.floor(ms / 3_600_000) % 24;
  const d = Math.floor(ms / 86_400_000);
  return { days: d, hours: h, minutes: m, seconds: s };
}

function twoDigits(value: number): string {
  return String(value).padStart(2, '0');
}

export function CountdownTimer({
  eventDate,
  inverted = false,
}: CountdownTimerProps) {
  const locale = useLocale();
  const t = useTranslations('GuestEvent');
  const [units, setUnits] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  /** Only set in useEffect so initial server and client render match (no Date.now() in render). */
  const [eventEnded, setEventEnded] = useState<boolean | null>(null);

  useEffect(() => {
    if (!eventDate) {
      setUnits(null);
      setEventEnded(null);
      return;
    }
    const isPast = eventDate.getTime() <= Date.now();
    setEventEnded(isPast);
    if (isPast) {
      return;
    }
    const tick = () => setUnits(diff(eventDate));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [eventDate]);

  const muteClass = inverted
    ? 'text-white/80'
    : 'text-[var(--theme-text-muted)]';
  const numClass = inverted
    ? 'text-[var(--theme-primary-light)]'
    : 'text-[var(--theme-primary)]';
  const fallbackText = formatLocalDateTime(eventDate, locale);

  if (!eventDate) {
    return <p className={`font-nunito ${muteClass}`} suppressHydrationWarning>{fallbackText}</p>;
  }

  if (eventEnded === null || (eventEnded === false && units === null)) {
    return <p className={`font-nunito ${muteClass}`} suppressHydrationWarning>{fallbackText}</p>;
  }

  if (eventEnded === true) {
    return (
      <p className={`font-nunito ${muteClass}`} role="status">
        {t('event_ended')}
      </p>
    );
  }

  if (!units) {
    return <p className={`font-nunito ${muteClass}`} suppressHydrationWarning>{fallbackText}</p>;
  }

  return (
    <div
      className="flex items-start justify-center gap-2 sm:gap-3"
      role="timer"
      aria-label={t('countdown_aria')}
    >
      <div className="flex flex-col items-center">
        <span
          className={`font-bricolage text-2xl font-extrabold leading-none sm:text-3xl ${numClass}`}
        >
          {twoDigits(units.days)}
        </span>
        <span
          className={`mt-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.14em] ${muteClass}`}
        >
          {t('days')}
        </span>
      </div>
      <span className={`pt-0.5 font-bricolage text-xl leading-none ${muteClass}`} aria-hidden>:</span>
      <div className="flex flex-col items-center">
        <span
          className={`font-bricolage text-2xl font-extrabold leading-none sm:text-3xl ${numClass}`}
        >
          {twoDigits(units.hours)}
        </span>
        <span
          className={`mt-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.14em] ${muteClass}`}
        >
          {t('hours')}
        </span>
      </div>
      <span className={`pt-0.5 font-bricolage text-xl leading-none ${muteClass}`} aria-hidden>:</span>
      <div className="flex flex-col items-center">
        <span
          className={`font-bricolage text-2xl font-extrabold leading-none sm:text-3xl ${numClass}`}
        >
          {twoDigits(units.minutes)}
        </span>
        <span
          className={`mt-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.14em] ${muteClass}`}
        >
          {t('minutes')}
        </span>
      </div>
      <span className={`pt-0.5 font-bricolage text-xl leading-none ${muteClass}`} aria-hidden>:</span>
      <div className="flex flex-col items-center">
        <span
          className={`font-bricolage text-2xl font-extrabold leading-none sm:text-3xl ${numClass}`}
          aria-live="polite"
        >
          {twoDigits(units.seconds)}
        </span>
        <span
          className={`mt-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.14em] ${muteClass}`}
        >
          {t('seconds')}
        </span>
      </div>
    </div>
  );
}
