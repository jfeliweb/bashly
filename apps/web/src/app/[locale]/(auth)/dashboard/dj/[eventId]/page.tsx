import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { SongQueuePanel } from '@/features/songs/SongQueuePanel';
import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventRoleTable, eventTable } from '@/models/Schema';

type PageProps = {
  params: Promise<{ eventId: string; locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'DjDashboard' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function DjDashboardPage({ params }: PageProps) {
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

  if (!role || role.role !== 'dj') {
    notFound();
  }

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.id, eventId),
    columns: {
      title: true,
      eventDate: true,
      venueName: true,
      songRequestsEnabled: true,
      songVotingEnabled: true,
      status: true,
    },
  });

  if (!event) {
    notFound();
  }
  if (event.status === 'archived') {
    notFound();
  }

  const t = await getTranslations('DjDashboard');

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{event.title}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
        {event.eventDate
          ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {event.eventDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )
          : null}
        {event.venueName
          ? (
              <p className="text-sm text-muted-foreground">
                📍
                {' '}
                {event.venueName}
              </p>
            )
          : null}
      </div>

      {!event.songRequestsEnabled
        ? (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {t('songs_disabled_hint')}
              </p>
            </div>
          )
        : null}

      <SongQueuePanel eventId={eventId} djMode />
    </div>
  );
}
