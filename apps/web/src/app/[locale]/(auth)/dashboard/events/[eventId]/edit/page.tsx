import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import {
  EditEventForm,
  type EditEventFormDefaults,
} from '@/features/events/EditEventForm';
import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventRoleTable, eventTable } from '@/models/Schema';
import type { InferSelectModel } from 'drizzle-orm';

type PageProps = {
  params: Promise<{ eventId: string; locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { eventId } = await params;
  const t = await getTranslations('EventDetail');
  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.id, eventId),
    columns: { title: true },
  });
  return {
    title: event ? `${t('edit_event')} — ${event.title}` : t('edit_event'),
  };
}

const EVENT_TYPE_VALUES = [
  'sweet16',
  'quinceanera',
  'anniversary',
  'graduation',
  'reunion',
  'birthday',
  'custom',
] as const;
const THEME_IDS = ['theme1', 'theme2', 'theme3', 'theme4', 'theme5'] as const;
const ADDRESS_VISIBLE = ['always', 'after_rsvp'] as const;

function eventToFormDefaults(
  event: InferSelectModel<typeof eventTable>,
): EditEventFormDefaults {
  const eventDate = event.eventDate;
  const dateStr = eventDate ? eventDate.toISOString().slice(0, 10) : '';
  const timeStr = eventDate ? eventDate.toTimeString().slice(0, 5) : '';

  const eventType = event.eventType ?? 'sweet16';
  const themeId = event.themeId ?? 'theme1';
  const addressVisible = event.addressVisible ?? 'after_rsvp';

  return {
    event_type: EVENT_TYPE_VALUES.includes(eventType as (typeof EVENT_TYPE_VALUES)[number])
      ? (eventType as (typeof EVENT_TYPE_VALUES)[number])
      : 'sweet16',
    title: event.title ?? '',
    event_date_str: dateStr,
    event_time_str: timeStr,
    venue_name: event.venueName ?? '',
    venue_address: event.venueAddress ?? '',
    dress_code: event.dressCode ?? '',
    welcome_message: event.welcomeMessage ?? '',
    theme_id: THEME_IDS.includes(themeId as (typeof THEME_IDS)[number])
      ? (themeId as (typeof THEME_IDS)[number])
      : 'theme1',
    address_visible: ADDRESS_VISIBLE.includes(addressVisible as (typeof ADDRESS_VISIBLE)[number])
      ? (addressVisible as (typeof ADDRESS_VISIBLE)[number])
      : 'after_rsvp',
    song_requests_enabled: event.songRequestsEnabled ?? true,
    song_requests_per_guest: event.songRequestsPerGuest ?? 5,
    song_voting_enabled: event.songVotingEnabled ?? false,
    registry_enabled: event.registryEnabled ?? true,
    cover_image_url: event.coverImageUrl ?? '',
    cover_image_key: event.coverImageKey ?? '',
  };
}

export default async function EditEventPage({ params }: PageProps) {
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

  const canEdit = role?.role === 'owner' || role?.role === 'co_host';
  if (!canEdit) {
    notFound();
  }

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.id, eventId),
  });

  if (!event) {
    notFound();
  }

  const t = await getTranslations('EventDetail');
  const defaultValues = eventToFormDefaults(event);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="min-h-[44px]">
          <Link href={`/dashboard/events/${eventId}`}>
            ← {t('back_to_events')}
          </Link>
        </Button>
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
        {t('edit_event')}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {event.title}
      </p>
      <div className="mt-8">
        <EditEventForm eventId={eventId} defaultValues={defaultValues} />
      </div>
    </div>
  );
}
