'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { Suspense, useEffect } from 'react';

import { Env } from '@/libs/Env';

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (!pathname || !ph) {
      return;
    }

    let url = window.origin + pathname;
    const search = searchParams.toString();
    if (search) {
      url += `?${search}`;
    }

    ph.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams, ph]);

  return null;
}

function PostHogInit() {
  useEffect(() => {
    if (
      typeof window === 'undefined'
      || Env.NODE_ENV !== 'production'
      || !Env.NEXT_PUBLIC_POSTHOG_KEY
    ) {
      return;
    }

    posthog.init(Env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: Env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      capture_pageview: false,
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
    });
  }, []);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (
    Env.NODE_ENV !== 'production'
    || !Env.NEXT_PUBLIC_POSTHOG_KEY
  ) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogInit />
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
