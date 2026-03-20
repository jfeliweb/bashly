'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { EventDateTimeText } from '@/features/events/EventDateTimeText';
import { cn } from '@/utils/Helpers';

type RsvpStatus = 'attending' | 'maybe' | 'declined';

type GuestRsvpEntry = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  plusOnes: number;
  dietaryRestrictions: string | null;
  status: string;
  createdAt: string;
};

type GuestRsvpPanelProps = {
  rsvpEntries: GuestRsvpEntry[];
};

function toKnownStatus(value: string): RsvpStatus {
  if (value === 'declined' || value === 'maybe') {
    return value;
  }
  return 'attending';
}

function statusBadgeClass(status: RsvpStatus): string {
  if (status === 'attending') {
    return 'border-[rgb(48,153,0)] bg-[rgb(238,255,229)] text-[rgb(48,153,0)] dark:border-[rgb(116,255,51)] dark:bg-[rgb(116,255,51)]/10 dark:text-[rgb(116,255,51)]';
  }

  if (status === 'maybe') {
    return 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300';
  }

  return 'border-destructive/50 bg-destructive/10 text-destructive';
}

export function GuestRsvpPanel({ rsvpEntries }: GuestRsvpPanelProps) {
  const t = useTranslations('EventDetail');
  const [activeTab, setActiveTab] = useState<'guest' | 'rsvp'>('guest');

  return (
    <section
      aria-labelledby="guest-rsvp-heading"
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="guest-rsvp-heading"
            className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]"
          >
            {t('guest_rsvp_heading')}
          </h2>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            {rsvpEntries.length}
            {' '}
            {t('stat_rsvps')}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={t('guest_rsvp_heading')}
          className="inline-flex rounded-[100px] border border-border bg-muted/30 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'guest'}
            className={cn(
              'min-h-[44px] rounded-[100px] px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]',
              activeTab === 'guest'
                ? 'bg-[rgb(81,255,0)] text-[rgb(9,21,27)]'
                : 'text-foreground hover:bg-muted',
            )}
            onClick={() => setActiveTab('guest')}
          >
            {t('guest_rsvp_tab_guest')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'rsvp'}
            className={cn(
              'min-h-[44px] rounded-[100px] px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]',
              activeTab === 'rsvp'
                ? 'bg-[rgb(81,255,0)] text-[rgb(9,21,27)]'
                : 'text-foreground hover:bg-muted',
            )}
            onClick={() => setActiveTab('rsvp')}
          >
            {t('guest_rsvp_tab_rsvp')}
          </button>
        </div>
      </div>

      {rsvpEntries.length === 0 && (
        <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
          {t('guest_rsvp_empty')}
        </p>
      )}

      {rsvpEntries.length > 0 && activeTab === 'guest' && (
        <div role="list" className="mt-4 space-y-3">
          {rsvpEntries.map((entry) => {
            const status = toKnownStatus(entry.status);

            return (
              <article
                key={entry.id}
                role="listitem"
                className="rounded-lg border border-border px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{entry.name}</p>
                  <span
                    className={cn(
                      'inline-flex rounded-[100px] border px-2.5 py-0.5 font-mono text-xs font-semibold',
                      statusBadgeClass(status),
                    )}
                  >
                    {t(`guest_rsvp_status_${status}` as 'guest_rsvp_status_attending')}
                  </span>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {entry.email || entry.phone
                    ? `${entry.email ?? t('guest_rsvp_not_available')} | ${entry.phone ?? t('guest_rsvp_not_available')}`
                    : t('guest_rsvp_no_contact')}
                </p>

                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {t('guest_rsvp_plus_ones')}
                  {': '}
                  {entry.plusOnes}
                </p>

                {entry.dietaryRestrictions && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('guest_rsvp_dietary')}
                    {': '}
                    {entry.dietaryRestrictions}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {rsvpEntries.length > 0 && activeTab === 'rsvp' && (
        <div role="list" className="mt-4 space-y-3">
          {rsvpEntries.map((entry) => {
            const status = toKnownStatus(entry.status);

            return (
              <article
                key={entry.id}
                role="listitem"
                className="rounded-lg border border-border px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={cn(
                      'inline-flex rounded-[100px] border px-2.5 py-0.5 font-mono text-xs font-semibold',
                      statusBadgeClass(status),
                    )}
                  >
                    {t(`guest_rsvp_status_${status}` as 'guest_rsvp_status_attending')}
                  </span>
                  <p className="text-sm font-semibold text-foreground">{entry.name}</p>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {entry.email || entry.phone
                    ? `${entry.email ?? t('guest_rsvp_not_available')} | ${entry.phone ?? t('guest_rsvp_not_available')}`
                    : t('guest_rsvp_no_contact')}
                </p>

                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {t('guest_rsvp_submitted')}
                  {': '}
                  <EventDateTimeText value={entry.createdAt} fallback={t('guest_rsvp_not_available')} timeZone="viewer" />
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
