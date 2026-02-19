import { useTranslations } from 'next-intl';

import { PricingCard } from '@/features/billing/PricingCard';
import { PricingFeature } from '@/features/billing/PricingFeature';
import { PlanConfig, type PlanId } from '@/utils/AppConfig';

export const PricingInformation = (props: {
  buttonList: Record<PlanId, React.ReactNode>;
}) => {
  const t = useTranslations('PricingPlan');

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
      {(Object.entries(PlanConfig) as [PlanId, (typeof PlanConfig)[PlanId]][]).map(
        ([planId, plan]) => (
          <PricingCard
            key={planId}
            planId={planId}
            price={plan.price}
            billing={plan.billing}
            button={props.buttonList[planId]}
          >
            <PricingFeature>
              {plan.features.activeEvents >= 999
                ? t('feature_active_events', { number: '∞' })
                : t('feature_active_events', {
                    number: plan.features.activeEvents,
                  })}
            </PricingFeature>
            <PricingFeature>
              {plan.features.guestsPerEvent >= 999999
                ? t('feature_guests_per_event', { number: '∞' })
                : t('feature_guests_per_event', {
                    number: plan.features.guestsPerEvent,
                  })}
            </PricingFeature>
            <PricingFeature>
              {plan.features.songRequests >= 999999
                ? t('feature_song_requests', { number: '∞' })
                : t('feature_song_requests', {
                    number: plan.features.songRequests,
                  })}
            </PricingFeature>
            {plan.features.streamingExport && (
              <PricingFeature>{t('feature_streaming_export')}</PricingFeature>
            )}
            <PricingFeature>
              {plan.features.registryLinks >= 999
                ? t('feature_registry_links', { number: '∞' })
                : t('feature_registry_links', {
                    number: plan.features.registryLinks,
                  })}
            </PricingFeature>
          </PricingCard>
        ),
      )}
    </div>
  );
};
