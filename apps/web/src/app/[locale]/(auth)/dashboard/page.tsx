import { count, desc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventTable, rsvpTable } from '@/models/Schema';
import { Logo } from '@/templates/Logo';
import { cn } from '@/utils/Helpers';

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

export default async function DashboardEventsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect('/sign-in');
  }

  const events = await db
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
    .orderBy(desc(eventTable.eventDate));

  const t = await getTranslations('EventsList');

  return (
    <>
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

      {events.length === 0
        ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center">
              <div className="flex max-w-sm flex-col items-center rounded-xl border border-border bg-card p-8 text-center shadow-sm">
                <div className="mb-4">
                  <Logo />
                </div>
                <h2 className="text-xl font-extrabold text-foreground">
                  {t('empty_title')}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {t('empty_description')}
                </p>
                <Button
                  asChild
                  className="mt-6 min-h-[44px] rounded-[100px] bg-[rgb(81,255,0)] font-bold text-[rgb(9,21,27)] hover:bg-[rgb(65,204,0)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
                >
                  <Link href="/dashboard/events/new">{t('empty_cta')}</Link>
                </Button>
              </div>
            </div>
          )
        : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                      {t('rsvp_count', { count: Number(ev.rsvp_count) })}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
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
                      <Link
                        href={`/dashboard/events/${ev.id}`}
                        className="text-sm font-semibold text-[rgb(37,90,116)] hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)] dark:text-[rgb(139,192,218)]"
                      >
                        {t('manage_link')}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
    </>
  );
}
