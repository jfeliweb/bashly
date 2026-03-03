import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AllLocales, AppConfig } from './utils/AppConfig';

const intlMiddleware = createMiddleware({
  locales: AllLocales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
  localeDetection: false,
});

const protectedPaths = ['/dashboard', '/onboarding'];

const LOCAL_ORIGIN_127 = 'http://127.0.0.1:3000';

/**
 * In dev, force all redirects to use 127.0.0.1 so we never send Location: localhost
 * (Spotify OAuth requires 127.0.0.1, not localhost).
 * `origin` is used to resolve relative Location headers so they don't fall back to 127.
 */
function ensureRedirectUses127(response: NextResponse, origin: string): NextResponse {
  if (response.status < 300 || response.status > 399) {
    return response;
  }
  const location = response.headers.get('Location');
  if (!location) {
    return response;
  }
  try {
    const url = new URL(location, origin);
    if (url.hostname === 'localhost') {
      const target = LOCAL_ORIGIN_127 + url.pathname + url.search;
      return NextResponse.redirect(target, response.status as 301 | 302 | 303 | 307 | 308);
    }
  } catch {
    // Leave unchanged if URL parsing fails
  }
  return response;
}

function isProtectedPath(pathname: string): boolean {
  // Never protect the auth API — unauthenticated users must be able to call it
  if (pathname.includes('/api/auth')) {
    return false;
  }

  if (pathname.includes('/api')) {
    return true;
  }

  return protectedPaths.some(path =>
    pathname.includes(path),
  );
}

export default async function middleware(request: NextRequest) {
  // Better Auth uses the __Secure- prefix on cookie names when baseURL is https://.
  // Check both names so the middleware works in dev (plain name) and production (__Secure- prefix).
  const sessionToken
    = request.cookies.get('better-auth.session_token')
      ?? request.cookies.get('__Secure-better-auth.session_token');
  const { pathname } = request.nextUrl;

  // In production use the real request origin; in dev force 127.0.0.1 so
  // Spotify OAuth never sees "localhost" (Spotify rejects localhost redirect URIs).
  const isDev = process.env.NODE_ENV === 'development';
  const appOrigin = isDev ? LOCAL_ORIGIN_127 : request.nextUrl.origin;

  // API routes live outside [locale]/ — never run intl middleware on them
  if (pathname.startsWith('/api')) {
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }
    if (pathname.startsWith('/api/stripe-webhook')) {
      return NextResponse.next();
    }
    if (pathname.startsWith('/api/events/') && pathname.endsWith('/songs')) {
      return NextResponse.next();
    }
    if (pathname.startsWith('/api/rsvp/')) {
      return NextResponse.next();
    }
    if (pathname.startsWith('/api/invites/')) {
      return NextResponse.next();
    }
    if (pathname.startsWith('/api/songs/search')) {
      return NextResponse.next();
    }
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtectedPath(pathname) && !sessionToken) {
    const locale = pathname.match(/^\/([a-z]{2})\//)?.at(1) ?? '';
    const signInUrl = new URL(
      locale ? `/${locale}/sign-in` : '/sign-in',
      appOrigin,
    );
    const redirect = NextResponse.redirect(signInUrl);
    return isDev ? ensureRedirectUses127(redirect, appOrigin) : redirect;
  }

  // Redirect authenticated users away from sign-in/sign-up pages
  if (
    !pathname.startsWith('/api')
    && (pathname.includes('/sign-in') || pathname.includes('/sign-up'))
    && sessionToken
  ) {
    const locale = pathname.match(/^\/([a-z]{2})\//)?.at(1) ?? '';
    const dashboardUrl = new URL(
      locale ? `/${locale}/dashboard` : '/dashboard',
      appOrigin,
    );
    const redirect = NextResponse.redirect(dashboardUrl);
    return isDev ? ensureRedirectUses127(redirect, appOrigin) : redirect;
  }

  // With localePrefix "as-needed", default-locale-prefixed URLs should normalize
  // to unprefixed URLs ("/en/dashboard" -> "/dashboard"). Redirecting early keeps
  // us out of rewrite loops while still allowing next-intl to resolve locale
  // context on the canonical, unprefixed path.
  const defaultPrefix = `/${AppConfig.defaultLocale}`;
  if (pathname === defaultPrefix || pathname.startsWith(`${defaultPrefix}/`)) {
    const normalizedPath = pathname.slice(defaultPrefix.length) || '/';
    const normalizedUrl = new URL(
      `${normalizedPath}${request.nextUrl.search}`,
      appOrigin,
    );
    const redirect = NextResponse.redirect(normalizedUrl, 307);
    return isDev ? ensureRedirectUses127(redirect, appOrigin) : redirect;
  }

  const response = await intlMiddleware(request);
  return isDev ? ensureRedirectUses127(response, appOrigin) : response;
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'],
};
