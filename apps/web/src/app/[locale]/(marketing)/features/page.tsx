import type { Metadata } from 'next';
import {
  Users,
  Music,
  QrCode,
  Sparkles,
  Calendar,
  Share2,
  UserPlus,
  MessageSquare,
  Lock,
  Zap,
} from 'lucide-react';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { BaseTemplate } from '@/templates/BaseTemplate';

type FeatureId =
  | 'guest_management'
  | 'song_requests'
  | 'spotify_export'
  | 'invite_links'
  | 'event_schedule'
  | 'gift_registry'
  | 'team_roles'
  | 'email_notifications'
  | 'privacy_security'
  | 'fast_reliable';

const FEATURE_ICONS: Record<FeatureId, React.ComponentType<{ className?: string }>> = {
  guest_management: Users,
  song_requests: Music,
  spotify_export: Sparkles,
  invite_links: QrCode,
  event_schedule: Calendar,
  gift_registry: Share2,
  team_roles: UserPlus,
  email_notifications: MessageSquare,
  privacy_security: Lock,
  fast_reliable: Zap,
};

const FEATURE_ORDER: FeatureId[] = [
  'guest_management',
  'song_requests',
  'spotify_export',
  'invite_links',
  'event_schedule',
  'gift_registry',
  'team_roles',
  'email_notifications',
  'privacy_security',
  'fast_reliable',
];

export async function generateMetadata(props: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'FeaturesPage',
  });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function FeaturesPage(props: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(props.params.locale);
  const t = await getTranslations('FeaturesPage');

  return (
    <BaseTemplate>
      <div className="bg-white dark:bg-background">
        {/* Hero */}
        <div className="bg-gradient-to-b from-cerulean-50 to-white py-16 dark:from-cerulean-950 dark:to-background sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {t('hero_title')}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {t('hero_description')}
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-16">
              {FEATURE_ORDER.map((featureId, idx) => {
                const Icon = FEATURE_ICONS[featureId];
                const details = [
                  t(`features.${featureId}.detail_0`),
                  t(`features.${featureId}.detail_1`),
                  t(`features.${featureId}.detail_2`),
                  t(`features.${featureId}.detail_3`),
                  t(`features.${featureId}.detail_4`),
                ].filter(Boolean);

                return (
                  <div
                    key={featureId}
                    className={`flex flex-col gap-8 ${
                      idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    } items-center`}
                  >
                    <div className="flex-1">
                      <div className="inline-flex items-center justify-center rounded-lg bg-cerulean-100 p-3 dark:bg-cerulean-900">
                        <Icon className="h-8 w-8 text-cerulean-600 dark:text-cerulean-400" />
                      </div>
                      <h2 className="mt-4 text-2xl font-bold text-foreground">
                        {t(`features.${featureId}.title`)}
                      </h2>
                      <p className="mt-2 text-lg text-muted-foreground">
                        {t(`features.${featureId}.description`)}
                      </p>
                      <ul className="mt-6 space-y-2">
                        {details.map((detail) => (
                          <li key={detail} className="flex items-start gap-2">
                            <svg
                              className="mt-0.5 h-5 w-5 flex-shrink-0 text-fern-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-muted-foreground">
                              {detail}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex-1">
                      <div
                        className="aspect-video rounded-xl bg-cerulean-100 dark:bg-cerulean-900/50"
                        aria-hidden
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-cerulean-50 py-16 dark:bg-cerulean-950/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                {t('cta_title')}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t('cta_description')}
              </p>
              <div className="mt-8">
                <a
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-full bg-fern-500 px-8 py-3 text-base font-semibold text-cerulean-950 shadow-sm hover:bg-fern-600 focus:outline focus:outline-3 focus:outline-[var(--focus-ring)] focus:outline-offset-3 min-h-[44px]"
                >
                  {t('cta_button')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
}
