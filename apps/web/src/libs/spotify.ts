import { and, eq } from 'drizzle-orm';

import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import { streamingConnectionTable } from '@/models/Schema';

// Spotify tokens expire in 3600 seconds. We refresh 5 minutes early to avoid
// mid-request expiry.
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

type SpotifyRefreshResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  // Spotify may rotate the refresh token — always save it if present
  refresh_token?: string;
};

export async function getValidSpotifyToken(userId: string): Promise<string | null> {
  const connection = await db.query.streamingConnectionTable.findFirst({
    where: and(
      eq(streamingConnectionTable.userId, userId),
      eq(streamingConnectionTable.platform, 'spotify'),
    ),
  });

  if (!connection) {
    return null;
  }

  // Check if the current token is still fresh (with buffer)
  const now = new Date();
  if (
    connection.tokenExpiresAt
    && connection.tokenExpiresAt.getTime() - now.getTime() > TOKEN_REFRESH_BUFFER_MS
  ) {
    return connection.accessToken;
  }

  // Token is expired or about to expire — refresh it
  if (!connection.refreshToken) {
    logger.error({ userId }, 'No refresh token available for Spotify');
    return null;
  }

  try {
    // PKCE token refresh rules:
    //   ✅ Send `client_id` in the body
    //   ✅ Send `refresh_token` in the body
    //   ❌ Do NOT send `client_secret`
    //   ❌ Do NOT send an `Authorization: Basic` header
    //
    // The standard Authorization Code flow uses Basic auth for refresh,
    // but PKCE clients are public clients — no secret exists.
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: connection.refreshToken,
        client_id: Env.SPOTIFY_CLIENT_ID,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      logger.error(
        { userId, status: response.status, body: errBody },
        'Spotify token refresh failed',
      );
      return null;
    }

    const data: SpotifyRefreshResponse = await response.json();
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    // Spotify may rotate the refresh token. If a new one is returned, save it —
    // the old one becomes invalid immediately.
    await db
      .update(streamingConnectionTable)
      .set({
        accessToken: data.access_token,
        tokenExpiresAt: expiresAt,
        // Only overwrite refreshToken if Spotify returned a new one
        ...(data.refresh_token && { refreshToken: data.refresh_token }),
      })
      .where(eq(streamingConnectionTable.id, connection.id));

    return data.access_token;
  } catch (error) {
    logger.error({ error, userId }, 'Failed to refresh Spotify token');
    return null;
  }
}

export async function createSpotifyPlaylist(
  userId: string,
  playlistName: string,
  trackUris: string[],
): Promise<{ id: string; url: string } | null> {
  const token = await getValidSpotifyToken(userId);
  if (!token) {
    return null;
  }

  try {
    // Create the playlist.
    //
    // Dev Mode endpoint (Feb 2026): POST /v1/me/playlists
    // The old endpoint POST /v1/users/{user_id}/playlists is only available
    // to Extended Quota Mode apps (250K+ MAU). Dev Mode apps must use /me/.
    const createRes = await fetch('https://api.spotify.com/v1/me/playlists', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: playlistName,
        description: 'Guest song requests curated via Bashly',
        public: false,
        collaborative: false,
      }),
    });

    if (!createRes.ok) {
      const errBody = await createRes.text();
      logger.error(
        { userId, status: createRes.status, body: errBody },
        'Failed to create Spotify playlist',
      );
      return null;
    }

    const playlist: { id: string; external_urls: { spotify: string } } = await createRes.json();

    // Add tracks in chunks of 100 (Spotify's per-request max).
    //
    // Dev Mode endpoint (Feb 2026): POST /v1/playlists/{id}/items
    // The old endpoint /tracks was renamed to /items for Dev Mode apps.
    const chunks = chunkArray(trackUris, 100);
    for (const chunk of chunks) {
      const addRes = await fetch(
        `https://api.spotify.com/v1/playlists/${playlist.id}/items`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: chunk }),
        },
      );

      if (!addRes.ok) {
        const errBody = await addRes.text();
        logger.error(
          { userId, status: addRes.status, body: errBody },
          'Failed to add tracks to Spotify playlist',
        );
        // Don't abort entirely — return the playlist with whatever was added
      }
    }

    return {
      id: playlist.id,
      url: playlist.external_urls.spotify,
    };
  } catch (error) {
    logger.error({ error, userId }, 'Failed to create Spotify playlist');
    return null;
  }
}

export async function addTracksToSpotifyPlaylist(
  userId: string,
  playlistId: string,
  trackUris: string[],
): Promise<boolean> {
  const token = await getValidSpotifyToken(userId);
  if (!token) {
    return false;
  }

  try {
    const chunks = chunkArray(trackUris, 100);
    for (const chunk of chunks) {
      // Dev Mode endpoint (Feb 2026): /items (not /tracks)
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/items`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: chunk }),
        },
      );

      if (!response.ok) {
        const errBody = await response.text();
        logger.error(
          { userId, playlistId, status: response.status, body: errBody },
          'Failed to add tracks to Spotify playlist',
        );
        return false;
      }
    }

    return true;
  } catch (error) {
    logger.error({ error, userId, playlistId }, 'Failed to add tracks');
    return false;
  }
}

/**
 * Replace all tracks in a playlist with the given URIs (max 100 per request).
 * For more than 100 tracks: clear with PUT uris:[], then add in chunks via POST.
 */
export async function replaceSpotifyPlaylistTracks(
  userId: string,
  playlistId: string,
  trackUris: string[],
): Promise<boolean> {
  const token = await getValidSpotifyToken(userId);
  if (!token) {
    return false;
  }

  const baseUrl = `https://api.spotify.com/v1/playlists/${playlistId}/items`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    if (trackUris.length <= 100) {
      const res = await fetch(baseUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ uris: trackUris }),
      });
      if (!res.ok) {
        const errBody = await res.text();
        logger.error(
          { userId, playlistId, status: res.status, body: errBody },
          'Failed to replace Spotify playlist tracks',
        );
        return false;
      }
      return true;
    }

    // Clear playlist first (PUT with empty uris)
    const clearRes = await fetch(baseUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ uris: [] }),
    });
    if (!clearRes.ok) {
      const errBody = await clearRes.text();
      logger.error(
        { userId, playlistId, status: clearRes.status, body: errBody },
        'Failed to clear Spotify playlist for replace',
      );
      return false;
    }

    return addTracksToSpotifyPlaylist(userId, playlistId, trackUris);
  } catch (error) {
    logger.error(
      { error, userId, playlistId },
      'Failed to replace Spotify playlist tracks',
    );
    return false;
  }
}

type SpotifySearchResponse = {
  tracks: {
    items: Array<{ uri: string }>;
  };
};

/**
 * Search Spotify for a track and return its URI.
 * Uses ISRC for an exact match; falls back to title + artist keyword search.
 * Returns `null` if no match is found or the search request fails.
 */
export async function searchSpotifyTrack(
  token: string,
  opts: { isrc?: string | null; trackTitle: string; artistName: string },
): Promise<string | null> {
  const query = opts.isrc
    ? `isrc:${opts.isrc}`
    : `track:${opts.trackTitle} artist:${opts.artistName}`;

  const url = new URL('https://api.spotify.com/v1/search');
  url.searchParams.set('q', query);
  url.searchParams.set('type', 'track');
  url.searchParams.set('limit', '1');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return null;
  }

  const data: SpotifySearchResponse = await res.json();
  const uri = data.tracks.items[0]?.uri ?? null;

  // If ISRC search returned nothing, retry with title + artist
  if (!uri && opts.isrc) {
    return searchSpotifyTrack(token, {
      isrc: null,
      trackTitle: opts.trackTitle,
      artistName: opts.artistName,
    });
  }

  return uri;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
