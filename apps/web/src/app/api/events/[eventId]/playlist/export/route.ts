import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import {
  createSpotifyPlaylist,
  getValidSpotifyToken,
  replaceSpotifyPlaylistTracks,
  searchSpotifyTrack,
} from '@/libs/spotify';
import {
  eventRoleTable,
  eventTable,
  playlistTable,
  songSuggestionTable,
  streamingConnectionTable,
} from '@/models/Schema';

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

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.id, eventId),
    columns: { title: true },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Check Spotify connection
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

  // Resolve Spotify URIs for any approved songs that are still missing one.
  // This makes the export a single-click action — no manual pre-step required.
  const token = await getValidSpotifyToken(session.user.id);
  if (token) {
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
      }
    }
  }

  // Get all approved songs that have been resolved to Spotify URIs
  const songs = await db
    .select()
    .from(songSuggestionTable)
    .where(
      and(
        eq(songSuggestionTable.eventId, eventId),
        eq(songSuggestionTable.status, 'approved'),
        isNotNull(songSuggestionTable.spotifyUri),
      ),
    );

  if (songs.length === 0) {
    return NextResponse.json(
      {
        error: 'No approved songs with Spotify URIs found. Run track resolution first.',
        code: 'NO_SONGS',
      },
      { status: 400 },
    );
  }

  const trackUris = songs
    .map(s => s.spotifyUri)
    .filter((uri): uri is string => uri !== null);

  // Check if a playlist already exists for this event on Spotify
  const existingPlaylist = await db.query.playlistTable.findFirst({
    where: and(
      eq(playlistTable.eventId, eventId),
      eq(playlistTable.streamingConnectionId, connection.id),
      eq(playlistTable.platform, 'spotify'),
    ),
  });

  if (existingPlaylist) {
    // Re-sync: replace playlist with current approved tracks (no duplicates)
    const success = await replaceSpotifyPlaylistTracks(
      session.user.id,
      existingPlaylist.platformPlaylistId,
      trackUris,
    );

    if (success) {
      await db
        .update(playlistTable)
        .set({
          lastSyncedAt: new Date(),
          trackCount: trackUris.length,
        })
        .where(eq(playlistTable.id, existingPlaylist.id));

      return NextResponse.json({
        message: 'Playlist updated',
        playlist_url: existingPlaylist.platformPlaylistUrl,
        tracks_added: trackUris.length,
      });
    }

    return NextResponse.json(
      { error: 'Failed to update playlist' },
      { status: 500 },
    );
  }

  // First export: create a new playlist
  const playlistName = `${event.title} — Guest Picks`;
  const result = await createSpotifyPlaylist(
    session.user.id,
    playlistName,
    trackUris,
  );

  if (!result) {
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 },
    );
  }

  await db.insert(playlistTable).values({
    eventId,
    streamingConnectionId: connection.id,
    platform: 'spotify',
    platformPlaylistId: result.id,
    platformPlaylistUrl: result.url,
    lastSyncedAt: new Date(),
    trackCount: trackUris.length,
  });

  return NextResponse.json({
    message: 'Playlist created',
    playlist_url: result.url,
    tracks_added: trackUris.length,
  });
}
// end of file
