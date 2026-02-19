import type { Metadata } from 'next';
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { ComingSoonBadge } from '@/components/placeholders/ComingSoonBadge';
import { BaseTemplate } from '@/templates/BaseTemplate';

type PlanId = 'free' | 'celebration' | 'premium' | 'planner';

type BillingKey = 'forever_free' | 'per_event' | 'per_month';

type PlanFeatureKey =
  | 'activeEvents'
  | 'guestsPerEvent'
  | 'songRequests'
  | 'streamingExport'
  | 'registryLinks'
  | 'emailNotifications'
  | 'qrCodes'
  | 'schedule'
  | 'teamRoles'
  | 'vendorPortal'
  | 'whiteLabel'
  | 'prioritySupport';

type PlanFeatures = Record<PlanFeatureKey, number | boolean>;

type Plan = {
  id: PlanId;
  price: number;
  billing: BillingKey;
  available: boolean;
  popular?: boolean;
  features: PlanFeatures;
};

type FeatureLabelKey =
  | 'features.active_events_label'
  | 'features.guests_per_event_label'
  | 'features.song_requests_label'
  | 'features.streaming_export_label'
  | 'features.registry_links_label'
  | 'features.email_notifications_label'
  | 'features.qr_codes_label'
  | 'features.schedule_label'
  | 'features.team_roles_label'
  | 'features.vendor_portal_label'
  | 'features.white_label_label'
  | 'features.priority_support_label';

type FeatureConfig = {
  key: PlanFeatureKey;
  labelKey: FeatureLabelKey;
  kind: 'boolean' | 'count';
  unlimitedThreshold?: number;
};

const plans: Plan[] = [
  {
    id: 'free',
    price: 0,
    billing: 'forever_free',
    available: true,
    features: {
      activeEvents: 1,
      guestsPerEvent: 50,
      songRequests: 50,
      streamingExport: false,
      registryLinks: 1,
      emailNotifications: true,
      qrCodes: true,
      schedule: true,
      teamRoles: false,
      vendorPortal: false,
      whiteLabel: false,
      prioritySupport: false,
    },
  },
  {
    id: 'celebration',
    price: 12,
    billing: 'per_event',
    available: false,
    popular: true,
    features: {
      activeEvents: 1,
      guestsPerEvent: 500,
      songRequests: 500,
      streamingExport: true,
      registryLinks: 10,
      emailNotifications: true,
      qrCodes: true,
      schedule: true,
      teamRoles: true,
      vendorPortal: false,
      whiteLabel: false,
      prioritySupport: false,
    },
  },
  {
    id: 'premium',
    price: 19,
    billing: 'per_month',
    available: false,
    features: {
      activeEvents: 999,
      guestsPerEvent: 1000,
      songRequests: 1000,
      streamingExport: true,
      registryLinks: 10,
      emailNotifications: true,
      qrCodes: true,
      schedule: true,
      teamRoles: true,
      vendorPortal: true,
      whiteLabel: false,
      prioritySupport: false,
    },
  },
  {
    id: 'planner',
    price: 49,
    billing: 'per_month',
    available: false,
    features: {
      activeEvents: 999,
      guestsPerEvent: 999999,
      songRequests: 999999,
      streamingExport: true,
      registryLinks: 999,
      emailNotifications: true,
      qrCodes: true,
      schedule: true,
      teamRoles: true,
      vendorPortal: true,
      whiteLabel: true,
      prioritySupport: true,
    },
  },
];

const allFeatures: FeatureConfig[] = [
  {
    key: 'activeEvents',
    labelKey: 'features.active_events_label',
    kind: 'count',
    unlimitedThreshold: 999,
  },
  {
    key: 'guestsPerEvent',
    labelKey: 'features.guests_per_event_label',
    kind: 'count',
    unlimitedThreshold: 1000,
  },
  {
    key: 'songRequests',
    labelKey: 'features.song_requests_label',
    kind: 'count',
    unlimitedThreshold: 1000,
  },
  {
    key: 'streamingExport',
    labelKey: 'features.streaming_export_label',
    kind: 'boolean',
  },
  {
    key: 'registryLinks',
    labelKey: 'features.registry_links_label',
    kind: 'count',
    unlimitedThreshold: 100,
  },
  {
    key: 'emailNotifications',
    labelKey: 'features.email_notifications_label',
    kind: 'boolean',
  },
  {
    key: 'qrCodes',
    labelKey: 'features.qr_codes_label',
    kind: 'boolean',
  },
  {
    key: 'schedule',
    labelKey: 'features.schedule_label',
    kind: 'boolean',
  },
  {
    key: 'teamRoles',
    labelKey: 'features.team_roles_label',
    kind: 'boolean',
  },
  {
    key: 'vendorPortal',
    labelKey: 'features.vendor_portal_label',
    kind: 'boolean',
  },
  {
    key: 'whiteLabel',
    labelKey: 'features.white_label_label',
    kind: 'boolean',
  },
  {
    key: 'prioritySupport',
    labelKey: 'features.priority_support_label',
    kind: 'boolean',
  },
];

export async function generateMetadata(props: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'PricingPage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function PricingPage(props: { params: { locale: string } }) {
  unstable_setRequestLocale(props.params.locale);
  const t = await getTranslations('PricingPage');

  return (
    <BaseTemplate>
      <div className="bg-white dark:bg-background">
        <div className="bg-gradient-to-b from-cerulean-50 to-white dark:from-cerulean-950 dark:to-background py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {t('hero_title')}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">{t('hero_subtitle')}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t('hero_disclaimer')}</p>
            </div>
          </div>
        </div>

        <div className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-4">
              {plans.map((plan) => {
                const planName = t(`plans.${plan.id}.name`);
                const planDescription = t(`plans.${plan.id}.description`);
                const billingLabel = t(`billing.${plan.billing}`);

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-xl border ${
                      plan.popular
                        ? 'border-cerulean-500 shadow-lg ring-2 ring-cerulean-500'
                        : 'border-cerulean-200 dark:border-cerulean-800'
                    } bg-white p-6 dark:bg-cerulean-950`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-fern-500 px-3 py-1 text-xs font-semibold text-cerulean-950">
                        {t('badges.most_popular')}
                      </span>
                    )}

                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{planName}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{planDescription}</p>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground">
                          ${plan.price}
                        </span>
                        <span className="text-sm text-muted-foreground">/{billingLabel}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      {plan.available ? (
                        <Link
                          href="/sign-up"
                          className="block w-full rounded-full bg-fern-500 py-2.5 text-center text-sm font-semibold text-cerulean-950 hover:bg-fern-400 focus:outline focus:outline-3 focus:outline-[var(--focus-ring)] focus:outline-offset-3"
                        >
                          {t('cta_free')}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="relative w-full rounded-full border border-cerulean-300 bg-cerulean-50 py-2.5 text-center text-sm font-semibold text-cerulean-700 opacity-60 dark:bg-cerulean-900/30 dark:text-cerulean-400"
                        >
                          {t('cta_coming_soon')}
                          <ComingSoonBadge className="absolute -top-2 -right-2" />
                        </button>
                      )}
                    </div>

                    <ul className="mt-6 space-y-3 text-sm">
                      {allFeatures.map((feature) => {
                        const rawValue = plan.features[feature.key];
                        const label = t(feature.labelKey);

                        if (feature.kind === 'boolean') {
                          const value = rawValue as boolean;

                          return (
                            <li
                              key={feature.key}
                              className="flex items-start gap-2"
                            >
                              {value ? (
                                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-fern-600" />
                              ) : (
                                <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                              )}
                              <span
                                className={
                                  value ? 'text-muted-foreground' : 'text-muted-foreground/60'
                                }
                              >
                                {label}
                              </span>
                            </li>
                          );
                        }

                        const numericValue = rawValue as number;
                        const isUnlimited =
                          feature.unlimitedThreshold !== undefined &&
                          numericValue >= feature.unlimitedThreshold;

                        const formattedValue = isUnlimited
                          ? t('features.unlimited')
                          : numericValue.toLocaleString();

                        return (
                          <li
                            key={feature.key}
                            className="flex items-start gap-2"
                          >
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-fern-600" />
                            <span className="text-muted-foreground">
                              {formattedValue} {label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="mt-16 text-center">
              <p className="text-sm text-muted-foreground">{t('beta_note')}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t.rich('contact_note', {
                  contact_link: (chunks) => (
                    <Link
                      href="/contact"
                      className="font-semibold text-cerulean-600 hover:text-cerulean-700 focus:outline focus:outline-3 focus:outline-[var(--focus-ring)] focus:outline-offset-3"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t bg-cerulean-50 py-16 dark:bg-cerulean-950/50 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center font-heading text-3xl font-bold text-foreground">
                {t('faq.heading')}
              </h2>

              <dl className="mt-12 space-y-8">
                <div>
                  <dt className="text-lg font-semibold text-foreground">
                    {t('faq.q1_title')}
                  </dt>
                  <dd className="mt-2 text-muted-foreground">{t('faq.q1_body')}</dd>
                </div>

                <div>
                  <dt className="text-lg font-semibold text-foreground">
                    {t('faq.q2_title')}
                  </dt>
                  <dd className="mt-2 text-muted-foreground">{t('faq.q2_body')}</dd>
                </div>

                <div>
                  <dt className="text-lg font-semibold text-foreground">
                    {t('faq.q3_title')}
                  </dt>
                  <dd className="mt-2 text-muted-foreground">{t('faq.q3_body')}</dd>
                </div>

                <div>
                  <dt className="text-lg font-semibold text-foreground">
                    {t('faq.q4_title')}
                  </dt>
                  <dd className="mt-2 text-muted-foreground">{t('faq.q4_body')}</dd>
                </div>

                <div>
                  <dt className="text-lg font-semibold text-foreground">
                    {t('faq.q5_title')}
                  </dt>
                  <dd className="mt-2 text-muted-foreground">{t('faq.q5_body')}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
}

