import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { streamingConnectionTable } from '@/models/Schema';

type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
};

type SpotifyProfileResponse = {
  id: string;
  display_name: string;
};

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL('/dashboard?error=spotify_auth_failed', req.url),
    );
  }

  if (!code || !state || state !== session.user.id) {
    return NextResponse.redirect(
      new URL('/dashboard?error=invalid_callback', req.url),
    );
  }

  const codeVerifier = req.cookies.get('spotify_code_verifier')?.value;
  if (!codeVerifier) {
    return NextResponse.redirect(
      new URL('/dashboard?error=missing_verifier', req.url),
    );
  }

  try {
    // Exchange the authorization code for tokens.
    //
    // PKCE rules — strictly followed:
    //   ✅ Send `code_verifier` in body — this IS the proof of identity
    //   ✅ Send `client_id` in body
    //   ❌ Do NOT send `client_secret` — PKCE doesn't use it
    //   ❌ Do NOT send an `Authorization: Basic` header
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: Env.SPOTIFY_REDIRECT_URI,
        client_id: Env.SPOTIFY_CLIENT_ID,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error('[Spotify Token Exchange Error]', tokenRes.status, errBody);
      throw new Error('Token exchange failed');
    }

    const tokens: SpotifyTokenResponse = await tokenRes.json();

    // Fetch the user's Spotify profile to get their display name and user ID
    const profileRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileRes.ok) {
      throw new Error('Profile fetch failed');
    }

    const profile: SpotifyProfileResponse = await profileRes.json();

    // Upsert the streaming connection — one row per user per platform
    // TODO: encrypt tokens at rest before production
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    await db
      .insert(streamingConnectionTable)
      .values({
        userId: session.user.id,
        platform: 'spotify',
        accessToken: tokens.access_token, // TODO: encrypt
        refreshToken: tokens.refresh_token, // TODO: encrypt
        tokenExpiresAt: expiresAt,
        platformUserId: profile.id,
        platformDisplayName: profile.display_name,
      })
      .onConflictDoUpdate({
        target: [
          streamingConnectionTable.userId,
          streamingConnectionTable.platform,
        ],
        set: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiresAt: expiresAt,
          platformUserId: profile.id,
          platformDisplayName: profile.display_name,
        },
      });

    // Clear the code_verifier cookie and send the user back to the dashboard
    const response = NextResponse.redirect(
      new URL('/dashboard?spotify_connected=true', req.url),
    );
    response.cookies.delete('spotify_code_verifier');
    return response;
  } catch (err) {
    console.error('[Spotify OAuth Error]', err);
    return NextResponse.redirect(
      new URL('/dashboard?error=token_exchange_failed', req.url),
    );
  }
}
