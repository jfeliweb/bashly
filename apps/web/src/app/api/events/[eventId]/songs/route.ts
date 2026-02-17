import { submitSongSchema } from '@saas/validators';
import { and, count, desc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventRoleTable, eventTable, songSuggestionTable } from '@/models/Schema';

const UUID_REGEX
  = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(s: string): boolean {
  return UUID_REGEX.test(s);
}

type RouteParams = { params: Promise<{ eventId: string }> };

async function hasAnyRole(eventId: string, userId: string): Promise<boolean> {
  const row = await db.query.eventRoleTable.findFirst({
    where: and(
      eq(eventRoleTable.eventId, eventId),
      eq(eventRoleTable.userId, userId),
    ),
  });
  return !!row;
}

/** Resolve route segment (UUID or slug) to event UUID. */
async function resolveEventId(segment: string): Promise<string | null> {
  if (isUuid(segment)) {
    return segment;
  }
  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.slug, segment),
    columns: { id: true },
  });
  return event?.id ?? null;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { eventId: segment } = await params;
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status'); // pending | approved | rejected | all

  const session = await auth.api.getSession({ headers: await headers() });

  // Guest-facing: unauthenticated GET with status=approved — treat segment as event slug
  if (!session && statusFilter === 'approved') {
    const event = await db.query.eventTable.findFirst({
      where: eq(eventTable.slug, segment),
      columns: { id: true, status: true, songVotingEnabled: true },
    });
    if (!event || event.status !== 'published') {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    const songs = await db
      .select()
      .from(songSuggestionTable)
      .where(
        and(
          eq(songSuggestionTable.eventId, event.id),
          eq(songSuggestionTable.status, 'approved'),
        ),
      )
      .orderBy(
        desc(songSuggestionTable.voteCount),
        desc(songSuggestionTable.createdAt),
      );
    return NextResponse.json({ songs });
  }

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const eventId = await resolveEventId(segment);
  if (!eventId) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const hasRole = await hasAnyRole(eventId, session.user.id);
  if (!hasRole) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let query = db
    .select()
    .from(songSuggestionTable)
    .where(eq(songSuggestionTable.eventId, eventId))
    .$dynamic();

  if (statusFilter && statusFilter !== 'all') {
    query = query.where(eq(songSuggestionTable.status, statusFilter));
  }

  const songs = await query.orderBy(
    desc(songSuggestionTable.voteCount),
    desc(songSuggestionTable.createdAt),
  );

  return NextResponse.json({ songs });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { eventId } = await params;

  // For unauthenticated guest submissions, the path segment is the public slug
  const slug = eventId;

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.slug, slug),
    columns: {
      id: true,
      status: true,
      songRequestsEnabled: true,
      songRequestsPerGuest: true,
    },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }
  // Allow published and draft (draft so preview guest page can test the widget)
  if (event.status !== 'published' && event.status !== 'draft') {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (!event.songRequestsEnabled) {
    return NextResponse.json(
      { error: 'Song requests are disabled for this event' },
      { status: 403 },
    );
  }

  const body = await req.json();
  const parsed = submitSongSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const perGuestLimit = event.songRequestsPerGuest ?? 0;

  // Check per-guest limit (0 = unlimited)
  if (perGuestLimit > 0 && data.fingerprint) {
    const [existingCount] = await db
      .select({ value: count() })
      .from(songSuggestionTable)
      .where(
        and(
          eq(songSuggestionTable.eventId, event.id),
          eq(songSuggestionTable.fingerprint, data.fingerprint),
        ),
      );

    const countValue = existingCount?.value ?? 0;
    if (countValue >= perGuestLimit) {
      return NextResponse.json(
        {
          error: `You can only request ${perGuestLimit} song(s) for this event`,
          code: 'LIMIT_REACHED',
        },
        { status: 422 },
      );
    }
  }

  // Check for duplicate (same iTunes track ID + fingerprint)
  if (data.fingerprint) {
    const existing = await db.query.songSuggestionTable.findFirst({
      where: and(
        eq(songSuggestionTable.eventId, event.id),
        eq(songSuggestionTable.itunesTrackId, data.itunes_track_id),
        eq(songSuggestionTable.fingerprint, data.fingerprint),
      ),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You already requested this song', code: 'DUPLICATE' },
        { status: 409 },
      );
    }
  }

  const inserted = await db
    .insert(songSuggestionTable)
    .values({
      eventId: event.id,
      itunesTrackId: data.itunes_track_id,
      trackTitle: data.track_title,
      artistName: data.artist_name,
      albumName: data.album_name,
      albumArtUrl: data.album_art_url,
      isrc: data.isrc,
      guestMessage: data.guest_message,
      guestName: data.guest_name,
      fingerprint: data.fingerprint,
      status: 'pending',
      voteCount: 0,
      sortOrder: 0,
    })
    .returning();

  const suggestion = inserted[0];
  if (!suggestion) {
    return NextResponse.json(
      { error: 'Failed to create suggestion' },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { suggestion_id: suggestion.id, message: 'Song added to queue!' },
    { status: 201 },
  );
}
