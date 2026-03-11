import { and, count, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { EventPaymentBadge } from '@/components/EventPaymentBadge';
import { Button } from '@/components/ui/button';
import { DeleteEventButton } from '@/features/events/DeleteEventButton';
import { EventDateTimeText } from '@/features/events/EventDateTimeText';
import { PublishEventButton } from '@/features/events/PublishEventButton';
import { CopyGuestUrl } from '@/features/invites/CopyGuestUrl';
import { InviteLinksPanel } from '@/features/invites/InviteLinksPanel';
import { QrCodePreview } from '@/features/invites/QrCodePreview';
import { RegistryLinksPanel } from '@/features/registry/RegistryLinksPanel';
import { SongQueuePanel } from '@/features/songs/SongQueuePanel';
import {
  ExportPlaylistButton,
  SpotifyConnectButton,
} from '@/features/streaming';
import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import {
  eventRoleTable,
  eventTable,
  playlistTable,
  rsvpTable,
  streamingConnectionTable,
} from '@/models/Schema';
import { isEventPaid } from '@/utils/eventAccess';
import { cn } from '@/utils/Helpers';

type PageProps = {
  params: Promise<{ eventId: string; locale: string }>;
};

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

  const isOwner = role.role === 'owner';
  const isCoHost = role.role === 'co_host';
  const canManageEvent = isOwner || isCoHost;

  if (!canManageEvent) {
    if (role.role === 'dj') {
      redirect(`/dashboard/dj/${eventId}`);
    }
    notFound();
  }

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.id, eventId),
  });

  if (!event) {
    notFound();
  }
  if (event.status === 'archived') {
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

  const playlist = streamingConnection
    ? await db.query.playlistTable.findFirst({
      where: and(
        eq(playlistTable.eventId, eventId),
        eq(playlistTable.streamingConnectionId, streamingConnection.id),
        eq(playlistTable.platform, 'spotify'),
      ),
    })
    : null;

  const t = await getTranslations('EventDetail');
  const tEventsList = await getTranslations('EventsList');

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
            {isOwner && (
              <EventPaymentBadge
                paymentStatus={event.paymentStatus}
                label={tEventsList('premium_badge')}
              />
            )}
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {event.title}
          </h1>
          {event.eventDate && (
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              <EventDateTimeText value={event.eventDate.toISOString()} fallback="—" />
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
          {isOwner && (
            <DeleteEventButton eventId={eventId} />
          )}
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
                  <EventDateTimeText value={event.rsvpDeadline.toISOString()} fallback="—" />
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
          <ul className="mt-4 space-y-3">
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
        <div className="space-y-6 lg:col-span-2">
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
                <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                  {isOwner && (
                    <SpotifyConnectButton
                      isConnected={Boolean(streamingConnection)}
                      displayName={streamingConnection?.platformDisplayName ?? undefined}
                    />
                  )}
                  <ExportPlaylistButton
                    eventId={eventId}
                    isSpotifyConnected={Boolean(streamingConnection)}
                    existingPlaylistUrl={playlist?.platformPlaylistUrl ?? null}
                  />
                </div>
              </div>
              <SongQueuePanel eventId={eventId} guestPagePath={`/e/${event.slug}`} />
            </div>
          )}

          {/* ── Invites & QR Code ──────────────────────────────────────────── */}
          <section className="space-y-4" aria-labelledby="invites-qr-heading">
            {event.status === 'published' && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2
                  id="invites-qr-heading"
                  className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]"
                >
                  {t('qr_code_heading')}
                </h2>

                <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  <div className="shrink-0">
                    <QrCodePreview eventId={eventId} slug={event.slug} />
                  </div>

                  <div className="flex flex-1 flex-col gap-4">
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        {t('guest_page_url_label')}
                      </p>
                      <CopyGuestUrl
                        url={`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/e/${event.slug}`}
                      />
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`/api/events/${eventId}/qr?format=png`}
                        download={`${event.slug}-qr.png`}
                        className="inline-flex min-h-[44px] items-center rounded-[100px] bg-[rgb(81,255,0)] px-4 py-2 text-sm font-bold text-[rgb(9,21,27)] hover:bg-[rgb(65,204,0)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
                        aria-label={t('download_png')}
                      >
                        ↓ PNG
                      </a>
                      <a
                        href={`/api/events/${eventId}/qr?format=svg`}
                        download={`${event.slug}-qr.svg`}
                        className="inline-flex min-h-[44px] items-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
                        aria-label={t('download_svg')}
                      >
                        SVG
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <InviteLinksPanel
              eventId={eventId}
              eventSlug={event.slug}
              isEventPaid={isEventPaid(event)}
            />
          </section>
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
