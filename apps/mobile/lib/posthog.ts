export const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
export const POSTHOG_HOST
  = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

export const isPostHogEnabled
  = process.env.NODE_ENV === 'production' && POSTHOG_KEY.length > 0;
