import {
  type NextRequest,
  NextResponse,
} from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AllLocales, AppConfig } from './utils/AppConfig';

const intlMiddleware = createMiddleware({
  locales: AllLocales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

const protectedPaths = ['/dashboard', '/onboarding'];

function isProtectedPath(pathname: string): boolean {
  // Never protect the auth API — unauthenticated users must be able to call it
  if (pathname.includes('/api/auth')) return false;

  if (pathname.includes('/api')) return true;

  return protectedPaths.some(path =>
    pathname.includes(path),
  );
}

export default async function middleware(request: NextRequest) {
  // Check for Better-Auth session cookie
  const sessionToken = request.cookies.get('better-auth.session_token');

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from protected routes
  if (isProtectedPath(pathname) && !sessionToken) {
    const locale = pathname.match(/^\/([a-z]{2})\//)?.at(1) ?? '';
    const signInUrl = new URL(
      locale ? `/${locale}/sign-in` : '/sign-in',
      request.url,
    );
    return NextResponse.redirect(signInUrl);
  }

  // Redirect authenticated users away from sign-in/sign-up pages
  if (
    (pathname.includes('/sign-in') || pathname.includes('/sign-up'))
    && sessionToken
  ) {
    const locale = pathname.match(/^\/([a-z]{2})\//)?.at(1) ?? '';
    const dashboardUrl = new URL(
      locale ? `/${locale}/dashboard` : '/dashboard',
      request.url,
    );
    return NextResponse.redirect(dashboardUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'],
};
