import { asc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { CountdownTimer } from '@/features/events/CountdownTimer';
import type { ScheduleItem } from '@/features/events/ScheduleList';
import { ScheduleList } from '@/features/events/ScheduleList';
import { RsvpButton } from '@/features/rsvp/RsvpButton';
import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventTable, scheduleItemTable } from '@/models/Schema';

export const revalidate = 60;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function formatEventDate(date: Date | null): string {
  if (!date) return '';
  const datePart = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
  return `${datePart} · ${timePart}`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.slug, slug),
    columns: { title: true, coverImageUrl: true },
  });
  if (!event) return {};
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

  const themeId = event.themeId ?? 'theme1';
  const formattedEventDate = formatEventDate(event.eventDate);

  return (
    <div
      className={`event-theme-${themeId} min-h-screen`}
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
        {event.coverImageUrl ? (
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
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark))`,
            }}
            aria-hidden
          />
        )}
        <div className="relative flex h-full flex-col justify-end px-6 pb-8">
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
        </div>
      </section>

      {/* 2. Event meta bar */}
      <div className="mx-auto max-w-[520px] px-4 py-4">
        {formattedEventDate && (
          <p className="font-mono text-sm font-semibold text-[var(--theme-text-muted)]">
            {formattedEventDate}
          </p>
        )}
        {event.venueName && (
          <p className="mt-1 font-nunito text-sm text-[var(--theme-text-muted)]">
            {event.venueName}
          </p>
        )}
      </div>

      {/* 3. Countdown timer */}
      <div className="bg-[var(--theme-primary-dark)] px-4 py-4 text-white">
        <div className="mx-auto max-w-[520px]">
          <Suspense
            fallback={
              <p className="font-nunito text-white/90">{formattedEventDate}</p>
            }
          >
            <CountdownTimer
              eventDate={event.eventDate}
              formattedFallback={formattedEventDate}
              inverted
            />
          </Suspense>
        </div>
      </div>

      {/* 4. RSVP button */}
      <div className="mx-auto max-w-[520px] px-4 py-6 text-center">
        <RsvpButton eventSlug={event.slug} eventTitle={event.title} />
      </div>

      {/* 5. Welcome message */}
      {event.welcomeMessage && (
        <section className="mx-auto max-w-[520px] px-4 pb-6">
          <div
            className="rounded-2xl px-5 py-4"
            style={{
              backgroundColor: 'var(--theme-surface-raised)',
              border: '1px solid var(--theme-border)',
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
        </section>
      )}

      {/* 6. Schedule */}
      {schedule.length > 0 && (
        <ScheduleList items={schedule} initialVisible={4} />
      )}

      {/* 7. Dress code */}
      {event.dressCode && (
        <section className="mx-auto max-w-[520px] px-4 pb-6">
          <div
            className="rounded-xl px-4 py-3"
            style={{
              backgroundColor: 'var(--theme-surface-raised)',
              border: '1px solid var(--theme-border)',
            }}
          >
            <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)]">
              👗 {t('dress_code_label')}
            </p>
            <p className="mt-1 font-nunito text-sm text-[var(--theme-text)]">
              {event.dressCode}
            </p>
          </div>
        </section>
      )}

      {/* 8. Registry placeholder — built in Step 9 */}
      {/* RegistrySection */}

      {/* 9. Map placeholder — EventMap built in Step 8 */}
      <section className="mx-auto max-w-[520px] px-4 pb-6">
        <div
          className="flex min-h-[160px] flex-col items-center justify-center rounded-xl bg-gray-200 px-4 py-6 text-center dark:bg-gray-700"
          style={{ backgroundColor: 'var(--theme-border)' }}
        >
          {event.venueAddress ? (
            <p className="font-nunito text-sm text-[var(--theme-text)]">
              {event.venueAddress}
            </p>
          ) : (
            <p className="font-nunito text-sm text-[var(--theme-text-muted)]">
              Venue address TBA
            </p>
          )}
        </div>
      </section>

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
            className="font-nunito text-xs text-[var(--theme-text-muted)] outline-none underline underline-offset-2 focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]"
          >
            {t('powered_by')}
          </a>
        </div>
      </footer>
    </div>
  );
}
