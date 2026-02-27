import { and, eq, isNull } from 'drizzle-orm';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { getValidSpotifyToken, searchSpotifyTrack } from '@/libs/spotify';
import { eventRoleTable, songSuggestionTable, streamingConnectionTable } from '@/models/Schema';

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

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId } = await params;
  const isAuthorized = await isOwnerOrCoHost(eventId, session.user.id);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const connection = await db.query.streamingConnectionTable.findFirst({
    where: and(
      eq(streamingConnectionTable.userId, session.user.id),
      eq(streamingConnectionTable.platform, 'spotify'),
    ),
  });

  if (!connection) {
    return NextResponse.json(
      { error: 'Spotify not connected', code: 'NO_CONNECTION' },
      { status: 400 },
    );
  }

  const token = await getValidSpotifyToken(session.user.id);
  if (!token) {
    return NextResponse.json(
      { error: 'Could not obtain a valid Spotify token', code: 'TOKEN_ERROR' },
      { status: 400 },
    );
  }

  // Fetch all approved songs that are missing a Spotify URI
  const unresolved = await db
    .select({
      id: songSuggestionTable.id,
      trackTitle: songSuggestionTable.trackTitle,
      artistName: songSuggestionTable.artistName,
      isrc: songSuggestionTable.isrc,
    })
    .from(songSuggestionTable)
    .where(
      and(
        eq(songSuggestionTable.eventId, eventId),
        eq(songSuggestionTable.status, 'approved'),
        isNull(songSuggestionTable.spotifyUri),
      ),
    );

  let resolved = 0;
  let failed = 0;

  for (const song of unresolved) {
    const uri = await searchSpotifyTrack(token, {
      isrc: song.isrc,
      trackTitle: song.trackTitle,
      artistName: song.artistName,
    });

    if (uri) {
      await db
        .update(songSuggestionTable)
        .set({ spotifyUri: uri })
        .where(eq(songSuggestionTable.id, song.id));
      resolved++;
    } else {
      failed++;
    }
  }

  return NextResponse.json({ resolved, failed, total: unresolved.length });
}
