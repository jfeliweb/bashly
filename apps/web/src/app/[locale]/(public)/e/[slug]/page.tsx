import { and, asc, eq } from 'drizzle-orm';
import { CalendarDays, Clock3, Info, ListOrdered, MapPin, Music2 } from 'lucide-react';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { GuestContactSection } from '@/features/events/components/GuestContactSection';
import { CountdownTimer } from '@/features/events/CountdownTimer';
import { EventDateTimeText } from '@/features/events/EventDateTimeText';
import { EventMap } from '@/features/events/EventMap';
import type { ScheduleItem } from '@/features/events/ScheduleList';
import { ScheduleList } from '@/features/events/ScheduleList';
import { RegistrySection } from '@/features/registry/RegistrySection';
import { RsvpButton } from '@/features/rsvp/RsvpButton';
import { SongRequestWidget } from '@/features/songs/SongRequestWidget';
import { SongVotingList } from '@/features/songs/SongVotingList';
import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventTable, rsvpTable, scheduleItemTable } from '@/models/Schema';

export const revalidate = 60;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.slug, slug),
    columns: { title: true, coverImageUrl: true },
  });
  if (!event) {
    return {};
  }
  return {
    title: `${event.title} — Bashly`,
    description: `You're invited to ${event.title}. RSVP and request songs.`,
    openGraph: {
      title: event.title,
      description: `You're invited to ${event.title}. RSVP and request songs.`,
      images: event.coverImageUrl ? [event.coverImageUrl] : [],
    },
  };
}

export default async function GuestEventPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const isPreview = resolvedSearchParams.preview === '1';
  const t = await getTranslations('GuestEvent');

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.slug, slug),
  });

  if (!event) {
    notFound();
  }

  if (event.status === 'draft') {
    if (!isPreview) {
      notFound();
    }
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.id !== event.ownerId) {
      notFound();
    }
  }

  const scheduleRows = await db
    .select()
    .from(scheduleItemTable)
    .where(eq(scheduleItemTable.eventId, event.id))
    .orderBy(asc(scheduleItemTable.sortOrder));

  const schedule: ScheduleItem[] = scheduleRows.map(row => ({
    id: row.id,
    startTime: row.startTime,
    title: row.title,
    note: row.note,
  }));

  const cookieStore = await cookies();
  const rsvpFingerprint = cookieStore.get('bashly_rsvp_fp')?.value ?? '';
  const guestHasRsvped = rsvpFingerprint
    ? Boolean(
        await db.query.rsvpTable.findFirst({
          where: and(
            eq(rsvpTable.eventId, event.id),
            eq(rsvpTable.fingerprint, rsvpFingerprint),
            eq(rsvpTable.status, 'attending'),
          ),
          columns: { id: true },
        }),
      )
    : false;

  const showContactSection = event.contactEnabled ?? false;
  const showContactForm
    = showContactSection
      && (event.contactFormVisible === 'always' || guestHasRsvped);
  const showPhone
    = Boolean(event.contactPhone)
      && (event.contactPhoneVisible === 'always' || guestHasRsvped);
  const showLockedHint
    = showContactSection && !showContactForm && !showPhone;

  const themeId = event.themeId ?? 'theme1';
  const eventDateIso = event.eventDate ? event.eventDate.toISOString() : null;

  return (
    <div
      className={`event-theme-${themeId} min-h-screen`} // eslint-disable-line tailwindcss/no-custom-classname -- dynamic theme
      style={{
        backgroundColor: 'var(--theme-surface)',
        color: 'var(--theme-text)',
      }}
    >
      {/* Preview banner for draft events */}
      {isPreview && event.status === 'draft' && (
        <div
          role="status"
          className="bg-amber-500 px-4 py-2 text-center font-mono text-xs font-semibold uppercase tracking-wider text-amber-950"
        >
          {t('preview_banner')}
        </div>
      )}

      {/* 1. Hero */}
      <section className="relative h-[420px] w-full overflow-hidden">
        {event.coverImageUrl
          ? (
              <>
                <Image
                  src={event.coverImageUrl}
                  alt={`${event.title} cover photo`}
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                  aria-hidden
                />
              </>
            )
          : (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(160deg, var(--theme-hero-start, var(--theme-primary-dark)) 0%, var(--theme-hero-mid, var(--theme-primary)) 45%, var(--theme-hero-end, var(--theme-accent)) 100%)',
                }}
                aria-hidden
              />
            )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/45" aria-hidden />
        <div className="relative mx-auto flex size-full max-w-[520px] flex-col justify-end px-4 pb-8">
          <span
            className="mb-3 inline-flex w-fit rounded-full border border-white/25 bg-white/20 px-3 py-1.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm"
            style={{ letterSpacing: '0.12em' }}
          >
            {event.eventType}
          </span>
          <h1
            className="font-bricolage text-3xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-4xl"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}
          >
            {event.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {eventDateIso && (
              <p className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-white/90">
                <CalendarDays className="size-3.5" aria-hidden />
                <EventDateTimeText value={eventDateIso} mode="date" />
              </p>
            )}
            {eventDateIso && (
              <p className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-white/90">
                <Clock3 className="size-3.5" aria-hidden />
                <EventDateTimeText value={eventDateIso} mode="time" />
              </p>
            )}
            {event.venueName && (
              <p className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-white/90">
                <MapPin className="size-3.5" aria-hidden />
                {event.venueName}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 2. Countdown timer */}
      <div className="bg-[var(--theme-primary-dark)] px-4 py-3 text-white">
        <div className="mx-auto max-w-[520px]">
          <Suspense
            fallback={
              (
                <p className="font-nunito text-white/90">
                  <EventDateTimeText value={eventDateIso} />
                </p>
              )
            }
          >
            <CountdownTimer
              eventDate={event.eventDate}
              inverted
            />
          </Suspense>
        </div>
      </div>

      <main className="mx-auto max-w-[520px] p-4">
        {/* 3. Welcome message */}
        {event.welcomeMessage && (
          <div
            className="mb-4 rounded-2xl border px-5 py-4 shadow-sm"
            style={{
              backgroundColor: 'var(--theme-surface-raised)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <span
              className="font-nunito text-2xl text-[var(--theme-text-muted)]"
              aria-hidden
            >
              &ldquo;
            </span>
            <p className="font-nunito text-base font-normal text-[var(--theme-text)]">
              {event.welcomeMessage}
            </p>
          </div>
        )}

        {/* 4. Song request + voting */}
        {(event.songRequestsEnabled || event.songVotingEnabled) && (
          <section
            className="mb-4 rounded-2xl border bg-[var(--theme-surface)] p-4 shadow-sm"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-xl bg-[var(--theme-primary-light)] p-2 text-[var(--theme-primary)]">
                <Music2 className="size-4" aria-hidden />
              </span>
              <p className="font-nunito text-sm font-bold text-[var(--theme-text)]">
                {t('music_section')}
              </p>
            </div>
            {event.songRequestsEnabled && (
              <Suspense fallback={<div className="h-32" />}>
                <SongRequestWidget
                  eventSlug={event.slug}
                  songRequestsEnabled={event.songRequestsEnabled}
                  songRequestsPerGuest={event.songRequestsPerGuest ?? 0}
                />
              </Suspense>
            )}
            {event.songVotingEnabled && (
              <Suspense fallback={<div className="h-32" />}>
                <SongVotingList
                  eventSlug={event.slug}
                  votingEnabled={event.songVotingEnabled}
                />
              </Suspense>
            )}
          </section>
        )}

        {/* 5. Schedule */}
        {schedule.length > 0 && (
          <section
            className="mb-4 rounded-2xl border bg-[var(--theme-surface)] p-4 shadow-sm"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-xl bg-[var(--theme-primary-light)] p-2 text-[var(--theme-primary)]">
                <ListOrdered className="size-4" aria-hidden />
              </span>
              <p className="font-nunito text-sm font-bold text-[var(--theme-text)]">
                {t('schedule_heading')}
              </p>
            </div>
            <ScheduleList items={schedule} initialVisible={6} />
          </section>
        )}

        {/* 6. Location */}
        {(event.venueLat && event.venueLng) || event.venueAddress
          ? (
              <section
                className="mb-4 rounded-2xl border bg-[var(--theme-surface)] p-4 shadow-sm"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-xl bg-[var(--theme-primary-light)] p-2 text-[var(--theme-primary)]">
                    <MapPin className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-nunito text-sm font-bold text-[var(--theme-text)]">
                      {t('location_heading')}
                    </p>
                    <p className="truncate font-nunito text-xs text-[var(--theme-text-muted)]">
                      {event.venueName ?? t('venue_tba')}
                    </p>
                  </div>
                </div>
                <EventMap
                  lat={event.venueLat ? Number(event.venueLat) : null}
                  lng={event.venueLng ? Number(event.venueLng) : null}
                  venueName={event.venueName}
                  venueAddress={event.venueAddress}
                />
              </section>
            )
          : null}

        {/* 7. Event details */}
        {event.dressCode && (
          <section
            className="mb-4 rounded-2xl border bg-[var(--theme-surface)] p-4 shadow-sm"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-xl bg-[var(--theme-primary-light)] p-2 text-[var(--theme-primary)]">
                <Info className="size-4" aria-hidden />
              </span>
              <p className="font-nunito text-sm font-bold text-[var(--theme-text)]">
                {t('event_details_heading')}
              </p>
            </div>
            {event.dressCode && (
              <div className="mb-3 rounded-xl border px-4 py-3" style={{ borderColor: 'var(--theme-border)' }}>
                <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)]">
                  {t('dress_code_label')}
                </p>
                <p className="mt-1 font-nunito text-sm text-[var(--theme-text)]">
                  {event.dressCode}
                </p>
              </div>
            )}
          </section>
        )}

        {/* 8. RSVP banner */}
        <section
          className="mb-4 rounded-2xl border bg-[var(--theme-surface)] p-4 shadow-sm"
          style={{ borderColor: 'var(--theme-border)' }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-nunito text-sm font-bold text-[var(--theme-text)]">
                {t('rsvp_now')}
              </p>
              <p className="font-nunito text-xs text-[var(--theme-text-muted)]">
                <EventDateTimeText value={eventDateIso} />
              </p>
            </div>
            <RsvpButton eventSlug={event.slug} eventTitle={event.title} />
          </div>
        </section>
      </main>

      <RegistrySection
        eventId={event.id}
        registryEnabled={event.registryEnabled ?? false}
      />

      {/* 9. Contact the Host */}
      {showContactSection && (
        <div className="mx-auto max-w-[520px] px-4 pb-6">
          <GuestContactSection
            eventSlug={event.slug}
            showForm={showContactForm}
            showPhone={showPhone}
            phone={event.contactPhone}
            showLockedHint={showLockedHint}
          />
        </div>
      )}

      {/* 10. Footer */}
      <footer className="border-t px-4 py-6" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="mx-auto flex max-w-[520px] flex-col items-center gap-2 text-center">
          <p className="font-nunito text-sm text-[var(--theme-text-muted)]">
            {event.title}
          </p>
          <a
            href="https://bashly.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-nunito text-xs text-[var(--theme-text-muted)] underline underline-offset-2 outline-none focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]"
          >
            {t('powered_by')}
          </a>
        </div>
      </footer>
    </div>
  );
}
