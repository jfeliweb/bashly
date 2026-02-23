import { and, count, desc, eq, ne } from 'drizzle-orm';
import { Calendar } from 'lucide-react';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { EventStatusBadge } from '@/components/EventStatusBadge';
import { StatsCardSkeleton } from '@/components/Skeleton';
import { StatsCards } from '@/features/dashboard/StatsCards';
import { QuickActions } from '@/features/dashboard/QuickActions';
import { DashboardWelcomeOverlay } from '@/features/onboarding/DashboardWelcomeOverlay';
import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventRoleTable, eventTable, rsvpTable } from '@/models/Schema';

type EventCard = {
  id: string;
  title: string;
  eventType: string;
  eventDate: Date | null;
  status: string | null;
  slug: string;
  rsvp_count: number;
  userRole: 'owner' | 'co_host' | 'dj' | 'vendor';
  hasDjRole: boolean;
  hasVendorRole: boolean;
};

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'EventsList',
  });
  return {
    title: t('title_bar'),
    description: t('title_bar_description'),
  };
}

function formatEventDate(date: Date | null): string {
  if (!date) {
    return '—';
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ welcome?: string }>;
};

export default async function DashboardEventsPage(props: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect('/sign-in');
  }

  const searchParams = await props.searchParams;

  const [ownedRows, djRoleRows, djOnlyRows, coHostRows, vendorRows]
    = await Promise.all([
      db
        .select({
          id: eventTable.id,
          title: eventTable.title,
          eventType: eventTable.eventType,
          eventDate: eventTable.eventDate,
          status: eventTable.status,
          slug: eventTable.slug,
          rsvp_count: count(rsvpTable.id),
        })
        .from(eventTable)
        .leftJoin(rsvpTable, eq(rsvpTable.eventId, eventTable.id))
        .where(eq(eventTable.ownerId, session.user.id))
        .groupBy(
          eventTable.id,
          eventTable.title,
          eventTable.eventType,
          eventTable.eventDate,
          eventTable.status,
          eventTable.slug,
        )
        .orderBy(desc(eventTable.eventDate)),
      db
        .select({ eventId: eventRoleTable.eventId })
        .from(eventRoleTable)
        .where(
          and(
            eq(eventRoleTable.userId, session.user.id),
            eq(eventRoleTable.role, 'dj'),
          ),
        ),
      db
        .select({
          id: eventTable.id,
          title: eventTable.title,
          eventType: eventTable.eventType,
          eventDate: eventTable.eventDate,
          status: eventTable.status,
          slug: eventTable.slug,
          rsvp_count: count(rsvpTable.id),
        })
        .from(eventRoleTable)
        .innerJoin(eventTable, eq(eventTable.id, eventRoleTable.eventId))
        .leftJoin(rsvpTable, eq(rsvpTable.eventId, eventTable.id))
        .where(
          and(
            eq(eventRoleTable.userId, session.user.id),
            eq(eventRoleTable.role, 'dj'),
            ne(eventTable.ownerId, session.user.id),
          ),
        )
        .groupBy(
          eventTable.id,
          eventTable.title,
          eventTable.eventType,
          eventTable.eventDate,
          eventTable.status,
          eventTable.slug,
        )
        .orderBy(desc(eventTable.eventDate)),
      db
        .select({
          id: eventTable.id,
          title: eventTable.title,
          eventType: eventTable.eventType,
          eventDate: eventTable.eventDate,
          status: eventTable.status,
          slug: eventTable.slug,
          rsvp_count: count(rsvpTable.id),
        })
        .from(eventRoleTable)
        .innerJoin(eventTable, eq(eventTable.id, eventRoleTable.eventId))
        .leftJoin(rsvpTable, eq(rsvpTable.eventId, eventTable.id))
        .where(
          and(
            eq(eventRoleTable.userId, session.user.id),
            eq(eventRoleTable.role, 'co_host'),
          ),
        )
        .groupBy(
          eventTable.id,
          eventTable.title,
          eventTable.eventType,
          eventTable.eventDate,
          eventTable.status,
          eventTable.slug,
        )
        .orderBy(desc(eventTable.eventDate)),
      db
        .select({
          id: eventTable.id,
          title: eventTable.title,
          eventType: eventTable.eventType,
          eventDate: eventTable.eventDate,
          status: eventTable.status,
          slug: eventTable.slug,
        })
        .from(eventRoleTable)
        .innerJoin(eventTable, eq(eventTable.id, eventRoleTable.eventId))
        .where(
          and(
            eq(eventRoleTable.userId, session.user.id),
            eq(eventRoleTable.role, 'vendor'),
          ),
        )
        .orderBy(desc(eventTable.eventDate)),
    ]);

  const djEventIds = new Set(djRoleRows.map(r => r.eventId));
  const ownedIds = new Set(ownedRows.map(r => r.id));
  const vendorEventIds = new Set(vendorRows.map(r => r.id));

  const ownedCards: EventCard[] = ownedRows.map(ev => ({
    id: ev.id,
    title: ev.title,
    eventType: ev.eventType,
    eventDate: ev.eventDate,
    status: ev.status,
    slug: ev.slug,
    rsvp_count: Number(ev.rsvp_count),
    userRole: 'owner',
    hasDjRole: djEventIds.has(ev.id),
    hasVendorRole: vendorEventIds.has(ev.id),
  }));

  const coHostEventIds = new Set(
    coHostRows.filter(ev => !ownedIds.has(ev.id)).map(ev => ev.id),
  );
  const coHostCards: EventCard[] = coHostRows
    .filter(ev => !ownedIds.has(ev.id))
    .map(ev => ({
      id: ev.id,
      title: ev.title,
      eventType: ev.eventType,
      eventDate: ev.eventDate,
      status: ev.status,
      slug: ev.slug,
      rsvp_count: Number(ev.rsvp_count),
      userRole: 'co_host',
      hasDjRole: djEventIds.has(ev.id),
      hasVendorRole: vendorEventIds.has(ev.id),
    }));

  const djOnlyEventIds = new Set(djOnlyRows.map(r => r.id));
  const djOnlyCards: EventCard[] = djOnlyRows
    .filter(ev => !coHostEventIds.has(ev.id))
    .map(ev => ({
      id: ev.id,
      title: ev.title,
      eventType: ev.eventType,
      eventDate: ev.eventDate,
      status: ev.status,
      slug: ev.slug,
      rsvp_count: Number(ev.rsvp_count),
      userRole: 'dj',
      hasDjRole: true,
      hasVendorRole: vendorEventIds.has(ev.id),
    }));

  const vendorOnlyCards: EventCard[] = vendorRows
    .filter(
      ev =>
        !ownedIds.has(ev.id)
        && !coHostEventIds.has(ev.id)
        && !djOnlyEventIds.has(ev.id),
    )
    .map(ev => ({
      id: ev.id,
      title: ev.title,
      eventType: ev.eventType,
      eventDate: ev.eventDate,
      status: ev.status,
      slug: ev.slug,
      rsvp_count: 0,
      userRole: 'vendor' as const,
      hasDjRole: false,
      hasVendorRole: true,
    }));

  const events: EventCard[] = [
    ...ownedCards,
    ...coHostCards,
    ...djOnlyCards,
    ...vendorOnlyCards,
  ].sort(
    (a, b) =>
      (b.eventDate?.getTime() ?? 0) - (a.eventDate?.getTime() ?? 0),
  );

  const t = await getTranslations('EventsList');

  const totalRsvps = events.reduce(
    (sum, ev) => sum + (ev.userRole === 'vendor' ? 0 : ev.rsvp_count),
    0,
  );
  const activeEvents = events.filter(
    ev => (ev.status ?? 'draft') === 'published',
  ).length;

  return (
    <>
      <DashboardWelcomeOverlay
        show={searchParams?.welcome === 'true'}
        userName={session.user.name ?? ''}
      />
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {t('title_bar')}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('title_bar_description')}
          </p>
        </div>
        <div className="mt-2 sm:mt-0">
          <Button
            asChild
            className="min-h-[44px] rounded-[100px] bg-[rgb(81,255,0)] px-6 font-bold text-[rgb(9,21,27)] hover:bg-[rgb(65,204,0)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
          >
            <Link href="/dashboard/events/new">{t('new_event_button')}</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Suspense
          fallback={(
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <StatsCardSkeleton
                  // eslint-disable-next-line react/no-array-index-key
                  key={`stats-card-fallback-${i.toString()}`}
                />
              ))}
            </div>
          )}
        >
          <StatsCards
            stats={{
              totalRsvps,
              totalSongs: 0,
              activeEvents,
              pendingSongs: 0,
            }}
          />
        </Suspense>

        <QuickActions />
      </div>

      {events.length === 0
        ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center">
              <EmptyState
                icon={Calendar}
                title={t('empty_title')}
                description={t('empty_description')}
                actionLabel={t('empty_cta_first')}
                actionHref="/dashboard/events/new"
              />
            </div>
          )
        : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((ev) => {
                const status = ev.status ?? 'draft';
                return (
                  <article
                    key={ev.id}
                    className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <h2 className="text-lg font-bold text-foreground">
                      {ev.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-widest text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]">
                        {eventTypeToLabel(ev.eventType)}
                      </span>
                      <span className="font-mono text-sm text-muted-foreground">
                        {formatEventDate(ev.eventDate)}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-sm text-muted-foreground">
                      {ev.userRole === 'vendor'
                        ? '—'
                        : t('rsvp_count', { count: Number(ev.rsvp_count) })}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <EventStatusBadge
                          status={status as 'draft' | 'published' | 'completed' | 'cancelled'}
                          label={t(`status_${status}` as 'status_draft')}
                          showPulse={status === 'published'}
                        />
                        {ev.userRole === 'co_host' && (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                            {t('co_host_badge')}
                          </span>
                        )}
                        {ev.userRole === 'vendor' && (
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                            {t('vendor_badge')}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {(ev.userRole === 'owner' || ev.userRole === 'co_host') && (
                          <Link
                            href={`/dashboard/events/${ev.id}`}
                            className="text-sm font-semibold text-[rgb(37,90,116)] hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)] dark:text-[rgb(139,192,218)]"
                          >
                            {t('manage_link')}
                          </Link>
                        )}
                        {(ev.userRole === 'dj' || ev.hasDjRole) && (
                          <Link
                            href={`/dashboard/dj/${ev.id}`}
                            className="text-sm font-semibold text-[rgb(37,90,116)] hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)] dark:text-[rgb(139,192,218)]"
                            aria-label={t('dj_queue_link')}
                          >
                            {t('dj_queue_link')}
                          </Link>
                        )}
                        {(ev.userRole === 'vendor' || ev.hasVendorRole) && (
                          <Link
                            href={`/dashboard/vendor/${ev.id}`}
                            className="text-sm font-semibold text-purple-600 hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-purple-600 dark:text-purple-400 dark:focus-visible:outline-purple-400"
                            aria-label={t('vendor_info_link')}
                          >
                            {t('vendor_info_link')}
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
    </>
  );
}
