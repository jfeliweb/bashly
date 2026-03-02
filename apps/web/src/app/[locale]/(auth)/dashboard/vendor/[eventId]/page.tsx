import { and, asc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventRoleTable, eventTable, scheduleItemTable } from '@/models/Schema';

type PageProps = {
  params: Promise<{ eventId: string; locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'VendorPortal' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function VendorPortalPage({ params }: PageProps) {
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

  if (!role || role.role !== 'vendor') {
    notFound();
  }

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.id, eventId),
    columns: {
      title: true,
      eventType: true,
      eventDate: true,
      doorsOpenAt: true,
      venueName: true,
      venueAddress: true,
      venueNotes: true,
      privateNotes: true,
      status: true,
    },
  });

  if (!event) {
    notFound();
  }
  if (event.status === 'archived') {
    notFound();
  }

  const schedule = await db
    .select()
    .from(scheduleItemTable)
    .where(eq(scheduleItemTable.eventId, eventId))
    .orderBy(asc(scheduleItemTable.sortOrder), asc(scheduleItemTable.startTime));

  const t = await getTranslations('VendorPortal');

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
            {t('badge')}
          </span>
        </div>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="mb-6 rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-bold">{t('event_details_heading')}</h2>
        <dl className="space-y-3">
          {event.eventDate && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('date_label')}
              </dt>
              <dd className="mt-1 text-base">
                {event.eventDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </dd>
            </div>
          )}

          {event.doorsOpenAt && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('doors_open_label')}
              </dt>
              <dd className="mt-1 text-base">
                {event.doorsOpenAt.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </dd>
            </div>
          )}

          {event.venueName && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('venue_label')}
              </dt>
              <dd className="mt-1 text-base">{event.venueName}</dd>
            </div>
          )}

          {event.venueAddress && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('address_label')}
              </dt>
              <dd className="mt-1 text-base">{event.venueAddress}</dd>
            </div>
          )}

          {event.venueNotes && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t('venue_notes_label')}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-base">
                {event.venueNotes}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {schedule.length > 0 && (
        <div className="mb-6 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-bold">{t('schedule_heading')}</h2>
          <div className="space-y-4">
            {schedule.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-24 shrink-0">
                  <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 font-mono text-sm font-medium text-muted-foreground">
                    {item.startTime}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.note && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {event.privateNotes && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/40">
          <h3 className="mb-2 text-lg font-bold text-blue-900 dark:text-blue-200">
            {t('vendor_notes_heading')}
          </h3>
          <p className="whitespace-pre-wrap text-blue-800 dark:text-blue-300">
            {event.privateNotes}
          </p>
        </div>
      )}

      <div className="mt-6 rounded-lg border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">{t('info_box')}</p>
      </div>
    </div>
  );
}
