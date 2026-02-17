import { and, count, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { PublishEventButton } from '@/features/events/PublishEventButton';
import { SpotifyConnectButton } from '@/features/streaming/SpotifyConnectButton';
import { SongQueuePanel } from '@/features/songs/SongQueuePanel';
import { RegistryLinksPanel } from '@/features/registry/RegistryLinksPanel';
import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import {
  eventRoleTable,
  eventTable,
  rsvpTable,
  streamingConnectionTable,
} from '@/models/Schema';
import { cn } from '@/utils/Helpers';

type PageProps = {
  params: Promise<{ eventId: string; locale: string }>;
};

function formatEventDate(date: Date | null): string {
  if (!date) {
    return '—';
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function eventTypeToLabel(eventType: string): string {
  const map: Record<string, string> = {
    sweet16: 'SWEET 16',
    quinceanera: 'QUINCEAÑERA',
    anniversary: 'ANNIVERSARY',
    graduation: 'GRADUATION',
    reunion: 'REUNION',
    birthday: 'BIRTHDAY',
    custom: 'CUSTOM',
  };
  return map[eventType] ?? eventType.toUpperCase();
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, eventId } = await params;
  const t = await getTranslations({ locale, namespace: 'EventDetail' });

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.id, eventId),
    columns: { title: true },
  });

  return {
    title: event ? `${event.title} — ${t('meta_title')}` : t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { eventId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/sign-in');
  }

  const role = await db.query.eventRoleTable.findFirst({
    where: and(
      eq(eventRoleTable.eventId, eventId),
      eq(eventRoleTable.userId, session.user.id),
    ),
    columns: { role: true },
  });

  if (!role) {
    notFound();
  }

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.id, eventId),
  });

  if (!event) {
    notFound();
  }

  const [rsvpResult] = await db
    .select({ value: count() })
    .from(rsvpTable)
    .where(eq(rsvpTable.eventId, eventId));

  const rsvpCount = rsvpResult?.value ?? 0;
  const status = event.status ?? 'draft';

  const streamingConnection = await db.query.streamingConnectionTable.findFirst({
    where: and(
      eq(streamingConnectionTable.userId, session.user.id),
      eq(streamingConnectionTable.platform, 'spotify'),
    ),
  });

  const t = await getTranslations('EventDetail');

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]">
              {eventTypeToLabel(event.eventType)}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold',
                status === 'draft'
                  && 'border-border bg-muted text-muted-foreground',
                status === 'published'
                  && 'border-[rgb(48,153,0)] bg-[rgb(238,255,229)] text-[rgb(48,153,0)] dark:border-[rgb(116,255,51)] dark:bg-[rgb(116,255,51)]/10 dark:text-[rgb(116,255,51)]',
                status === 'completed'
                  && 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-400/10 dark:text-blue-300',
                status === 'cancelled'
                  && 'border-destructive/50 bg-destructive/10 text-destructive',
              )}
            >
              {status === 'published' && (
                <span
                  className="mr-1.5 size-1.5 rounded-full bg-current motion-safe:animate-pulse"
                  aria-hidden
                />
              )}
              {t(`status_${status}` as 'status_draft')}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {event.title}
          </h1>
          {event.eventDate && (
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {formatEventDate(event.eventDate)}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-start gap-2">
          <Button
            asChild
            variant="outline"
            className="min-h-[44px] font-semibold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
          >
            <Link
              href={`/e/${event.slug}?preview=1`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('view_guest_page')}
            </Link>
          </Button>
          {status === 'draft' && (
            <PublishEventButton eventId={eventId} />
          )}
          <Button
            asChild
            variant={status === 'draft' ? 'outline' : undefined}
            className={cn(
              'min-h-[44px] font-semibold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]',
              status !== 'draft' && 'rounded-[100px] bg-[rgb(81,255,0)] px-6 font-bold text-[rgb(9,21,27)] hover:bg-[rgb(65,204,0)]',
            )}
          >
            <Link href={`/dashboard/events/${eventId}/edit`}>
              {t('edit_event')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <section aria-labelledby="stats-heading" className="mb-6">
        <h2 className="sr-only" id="stats-heading">{t('quick_stats')}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]">
              {t('stat_rsvps')}
            </span>
            <p className="mt-1 font-mono text-2xl font-bold text-foreground">
              {rsvpCount}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]">
              {t('stat_status')}
            </span>
            <p className="mt-1 font-mono text-2xl font-bold capitalize text-foreground">
              {t(`status_${status}` as 'status_draft')}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]">
              {t('stat_capacity')}
            </span>
            <p className="mt-1 font-mono text-2xl font-bold text-foreground">
              {event.maxCapacity ?? '∞'}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]">
              {t('stat_role')}
            </span>
            <p className="mt-1 font-mono text-2xl font-bold capitalize text-foreground">
              {t(`role_${role.role}` as 'role_owner')}
            </p>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section
          aria-labelledby="details-heading"
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <h2
            id="details-heading"
            className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]"
          >
            {t('event_details')}
          </h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-sm font-semibold text-muted-foreground">
                {t('venue_name')}
              </dt>
              <dd className="mt-0.5 text-foreground">
                {event.venueName || t('not_set')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-muted-foreground">
                {t('venue_address')}
              </dt>
              <dd className="mt-0.5 text-foreground">
                {event.venueAddress || t('not_set')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-muted-foreground">
                {t('dress_code')}
              </dt>
              <dd className="mt-0.5 text-foreground">
                {event.dressCode || t('not_set')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-muted-foreground">
                {t('address_visibility')}
              </dt>
              <dd className="mt-0.5 text-foreground">
                {event.addressVisible === 'always'
                  ? t('address_always')
                  : t('address_after_rsvp')}
              </dd>
            </div>
            {event.rsvpDeadline && (
              <div>
                <dt className="text-sm font-semibold text-muted-foreground">
                  {t('rsvp_deadline')}
                </dt>
                <dd className="mt-0.5 font-mono text-sm text-foreground">
                  {formatEventDate(event.rsvpDeadline)}
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* Features */}
        <section
          aria-labelledby="features-heading"
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <h2
            id="features-heading"
            className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]"
          >
            {t('features')}
          </h2>
          <ul className="mt-4 space-y-3" role="list">
            <li className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <span className="text-sm font-semibold text-foreground">
                {t('song_requests')}
              </span>
              <span
                className={cn(
                  'font-mono text-xs font-semibold',
                  event.songRequestsEnabled
                    ? 'text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]'
                    : 'text-muted-foreground',
                )}
              >
                {event.songRequestsEnabled ? t('enabled') : t('disabled')}
              </span>
            </li>
            {event.songRequestsEnabled && (
              <li className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <span className="text-sm font-semibold text-foreground">
                  {t('songs_per_guest')}
                </span>
                <span className="font-mono text-xs font-semibold text-muted-foreground">
                  {event.songRequestsPerGuest ?? 5}
                </span>
              </li>
            )}
            <li className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <span className="text-sm font-semibold text-foreground">
                {t('song_voting')}
              </span>
              <span
                className={cn(
                  'font-mono text-xs font-semibold',
                  event.songVotingEnabled
                    ? 'text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]'
                    : 'text-muted-foreground',
                )}
              >
                {event.songVotingEnabled ? t('enabled') : t('disabled')}
              </span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <span className="text-sm font-semibold text-foreground">
                {t('gift_registry')}
              </span>
              <span
                className={cn(
                  'font-mono text-xs font-semibold',
                  event.registryEnabled
                    ? 'text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]'
                    : 'text-muted-foreground',
                )}
              >
                {event.registryEnabled ? t('enabled') : t('disabled')}
              </span>
            </li>
          </ul>
        </section>

        {/* Gift Registry + Song Queue / Music */}
        <div className="lg:col-span-2 space-y-6">
          <RegistryLinksPanel
            eventId={eventId}
            registryEnabled={event.registryEnabled ?? true}
          />
          {event.songRequestsEnabled && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]">
                  {t('music_section')}
                </h2>
                <SpotifyConnectButton
                  isConnected={Boolean(streamingConnection)}
                  displayName={streamingConnection?.platformDisplayName ?? undefined}
                />
              </div>
              <SongQueuePanel eventId={eventId} />
            </div>
          )}
        </div>

        {/* Welcome Message */}
        {event.welcomeMessage && (
          <section
            aria-labelledby="welcome-heading"
            className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2"
          >
            <h2
              id="welcome-heading"
              className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]"
            >
              {t('welcome_message')}
            </h2>
            <p className="mt-3 whitespace-pre-line text-foreground">
              {event.welcomeMessage}
            </p>
          </section>
        )}
      </div>

      {/* Back to events link */}
      <div className="mt-8">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-[rgb(37,90,116)] hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)] dark:text-[rgb(139,192,218)]"
        >
          {t('back_to_events')}
        </Link>
      </div>
    </div>
  );
}
