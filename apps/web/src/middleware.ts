import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AllLocales, AppConfig } from './utils/AppConfig';

const intlMiddleware = createMiddleware({
  locales: AllLocales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

const protectedPaths = ['/dashboard', '/onboarding'];

const LOCAL_ORIGIN_127 = 'http://127.0.0.1:3000';

/** In dev, force all redirects to use 127.0.0.1 so we never send Location: localhost (Spotify requires 127.0.0.1). */
function ensureRedirectUses127(response: NextResponse): NextResponse {
  if (response.status < 300 || response.status > 399) {
    return response;
  }
  const location = response.headers.get('Location');
  if (!location) {
    return response;
  }
  try {
    const url = new URL(location, LOCAL_ORIGIN_127);
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
  const sessionToken = request.cookies.get('better-auth.session_token');
  const { pathname } = request.nextUrl;

  // API routes live outside [locale]/ — never run intl middleware on them
  if (pathname.startsWith('/api')) {
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }
    if (pathname.startsWith('/api/events/') && pathname.endsWith('/songs')) {
      return NextResponse.next();
    }
    if (pathname.startsWith('/api/rsvp/')) {
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
      LOCAL_ORIGIN_127,
    );
    return ensureRedirectUses127(NextResponse.redirect(signInUrl));
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
      LOCAL_ORIGIN_127,
    );
    return ensureRedirectUses127(NextResponse.redirect(dashboardUrl));
  }

  // Next.js 14 re-runs middleware on paths produced by internal rewrites.
  // With localePrefix 'as-needed', intlMiddleware rewrites "/" → "/en", then
  // middleware fires again for "/en" and intlMiddleware redirects back to "/"
  // → infinite loop. Break the loop: when the path already carries the default
  // locale prefix (e.g. "/en" or "/en/..."), serve it directly.
  const defaultPrefix = `/${AppConfig.defaultLocale}`;
  if (pathname === defaultPrefix || pathname.startsWith(`${defaultPrefix}/`)) {
    return NextResponse.next();
  }

  const response = await intlMiddleware(request);
  return ensureRedirectUses127(response);
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'],
};
