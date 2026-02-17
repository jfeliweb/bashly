import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/libs/auth';
import { Env } from '@/libs/Env';
import { generateCodeChallenge, generateCodeVerifier } from '@/utils/pkce';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    client_id: Env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: Env.SPOTIFY_REDIRECT_URI,
    // Request all three scopes upfront. Some public playlist operations return
    // 403 without playlist-modify-private present, so request both.
    scope: 'user-read-private playlist-modify-public playlist-modify-private',
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state: session.user.id, // Verified on callback to prevent CSRF
  }).toString()}`;

  const response = NextResponse.redirect(authUrl);

  // Store the code_verifier in a short-lived httpOnly cookie.
  // It must survive the redirect round-trip to Spotify and back.
  response.cookies.set('spotify_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  });

  return response;
}
