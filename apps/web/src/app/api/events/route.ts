import { createEventSchema } from '@saas/validators';
import { desc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventRoleTable, eventTable } from '@/models/Schema';
import { geocodeAddress } from '@/utils/geocode';
import { generateSlug } from '@/utils/slug';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const events = await db.query.eventTable.findMany({
    where: eq(eventTable.ownerId, userId),
    orderBy: [desc(eventTable.eventDate)],
  });

  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json();
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  const slug = generateSlug(parsed.data.title);

  // Geocode venue address (non-blocking on failure)
  let venueLat: string | undefined;
  let venueLng: string | undefined;
  if (parsed.data.venue_address) {
    const coords = await geocodeAddress(parsed.data.venue_address);
    if (coords) {
      venueLat = coords.lat.toString();
      venueLng = coords.lng.toString();
    }
  }

  const [event] = await db
    .insert(eventTable)
    .values({
      ownerId: userId,
      slug,
      title: parsed.data.title,
      eventType: parsed.data.event_type,
      description: parsed.data.description,
      coverImageUrl: parsed.data.cover_image_url,
      coverImageKey: parsed.data.cover_image_key,
      eventDate: parsed.data.event_date,
      doorsOpenAt: parsed.data.doors_open_at,
      venueName: parsed.data.venue_name,
      venueAddress: parsed.data.venue_address,
      venueLat,
      venueLng,
      venueNotes: parsed.data.venue_notes,
      dressCode: parsed.data.dress_code,
      welcomeMessage: parsed.data.welcome_message,
      maxCapacity: parsed.data.max_capacity,
      rsvpDeadline: parsed.data.rsvp_deadline,
      themeId: parsed.data.theme_id,
      addressVisible: parsed.data.address_visible,
      songRequestsEnabled: parsed.data.song_requests_enabled,
      songRequestsPerGuest: parsed.data.song_requests_per_guest,
      songVotingEnabled: parsed.data.song_voting_enabled,
      registryEnabled: parsed.data.registry_enabled,
      privateNotes: parsed.data.private_notes,
    })
    .returning();

  if (!event) {
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 },
    );
  }

  await db.insert(eventRoleTable).values({
    eventId: event.id,
    userId,
    role: 'owner',
  });

  return NextResponse.json({ event }, { status: 201 });
}
