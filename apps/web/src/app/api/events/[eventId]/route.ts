import { updateEventSchema } from '@saas/validators';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventRoleTable, eventTable } from '@/models/Schema';
import { AllLocales } from '@/utils/AppConfig';
import { geocodeAddress } from '@/utils/geocode';

type RouteParams = { params: Promise<{ eventId: string }> };

async function isOwnerOrCoHost(eventId: string, userId: string): Promise<boolean> {
  const row = await db.query.eventRoleTable.findFirst({
    where: and(
      eq(eventRoleTable.eventId, eventId),
      eq(eventRoleTable.userId, userId),
    ),
    columns: { role: true },
  });
  return row?.role === 'owner' || row?.role === 'co_host';
}

export async function GET(
  _req: NextRequest,
  { params }: RouteParams,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId } = await params;
  const canView = await isOwnerOrCoHost(eventId, session.user.id);
  if (!canView) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.id, eventId),
  });

  if (!event) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { eventId } = await params;
  const canManage = await isOwnerOrCoHost(eventId, session.user.id);
  if (!canManage) {
    return NextResponse.json(
      { error: 'Forbidden', code: 'INSUFFICIENT_ROLE' },
      { status: 403 },
    );
  }

  const body = await req.json();
  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Geocode venue address if it changed (non-blocking on failure)
  let geoFields: { venueLat?: string; venueLng?: string } = {};
  if (data.venue_address !== undefined) {
    if (data.venue_address) {
      const coords = await geocodeAddress(data.venue_address);
      if (coords) {
        geoFields = {
          venueLat: coords.lat.toString(),
          venueLng: coords.lng.toString(),
        };
      }
    } else {
      geoFields = { venueLat: undefined, venueLng: undefined };
    }
  }

  await db
    .update(eventTable)
    .set({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.event_type !== undefined && { eventType: data.event_type }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.cover_image_url !== undefined && { coverImageUrl: data.cover_image_url }),
      ...(data.cover_image_key !== undefined && { coverImageKey: data.cover_image_key }),
      ...(data.event_date !== undefined && { eventDate: data.event_date }),
      ...(data.doors_open_at !== undefined && { doorsOpenAt: data.doors_open_at }),
      ...(data.venue_name !== undefined && { venueName: data.venue_name }),
      ...(data.venue_address !== undefined && { venueAddress: data.venue_address }),
      ...geoFields,
      ...(data.venue_notes !== undefined && { venueNotes: data.venue_notes }),
      ...(data.dress_code !== undefined && { dressCode: data.dress_code }),
      ...(data.welcome_message !== undefined && { welcomeMessage: data.welcome_message }),
      ...(data.max_capacity !== undefined && { maxCapacity: data.max_capacity }),
      ...(data.rsvp_deadline !== undefined && { rsvpDeadline: data.rsvp_deadline }),
      ...(data.theme_id !== undefined && { themeId: data.theme_id }),
      ...(data.address_visible !== undefined && { addressVisible: data.address_visible }),
      ...(data.song_requests_enabled !== undefined && { songRequestsEnabled: data.song_requests_enabled }),
      ...(data.song_requests_per_guest !== undefined && { songRequestsPerGuest: data.song_requests_per_guest }),
      ...(data.song_voting_enabled !== undefined && { songVotingEnabled: data.song_voting_enabled }),
      ...(data.registry_enabled !== undefined && { registryEnabled: data.registry_enabled }),
      ...(data.private_notes !== undefined && { privateNotes: data.private_notes }),
      ...(data.status !== undefined && { status: data.status }),
    })
    .where(eq(eventTable.id, eventId));

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.id, eventId),
  });

  if (!event) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  for (const locale of AllLocales) {
    revalidatePath(`/${locale}/e/${event.slug}`);
  }

  return NextResponse.json(event);
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId } = await params;
  const role = await db.query.eventRoleTable.findFirst({
    where: and(
      eq(eventRoleTable.eventId, eventId),
      eq(eventRoleTable.userId, session.user.id),
    ),
    columns: { role: true },
  });

  if (role?.role !== 'owner') {
    return NextResponse.json(
      { error: 'Only the event owner can delete the event' },
      { status: 403 },
    );
  }

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.id, eventId),
    columns: { status: true },
  });

  if (!event) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (event.status === 'draft') {
    await db.delete(eventTable).where(eq(eventTable.id, eventId));
  } else {
    await db
      .update(eventTable)
      .set({ status: 'cancelled' })
      .where(eq(eventTable.id, eventId));
  }

  return new NextResponse(null, { status: 204 });
}
