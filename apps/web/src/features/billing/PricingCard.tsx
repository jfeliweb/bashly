import { useTranslations } from 'next-intl';
import React from 'react';

import type { PlanId } from '@/utils/AppConfig';

export const PricingCard = (props: {
  planId: PlanId;
  price: number;
  billing?: 'per-event' | 'monthly';
  button: React.ReactNode;
  children: React.ReactNode;
}) => {
  const t = useTranslations('PricingPlan');

  const intervalKey
    = props.billing === 'monthly'
      ? 'plan_interval_month'
      : props.billing === 'per-event'
        ? 'plan_interval_per_event'
        : null;

  return (
    <div className="rounded-xl border border-border px-6 py-8 text-center">
      <div className="text-lg font-semibold">
        {t(`${props.planId}_plan_name`)}
      </div>

      <div className="mt-3 flex items-center justify-center">
        <div className="text-5xl font-bold">
          {`$${props.price}`}
        </div>

        {intervalKey && (
          <div className="ml-1 text-muted-foreground">
            {`/ ${t(intervalKey)}`}
          </div>
        )}
      </div>

      <div className="mt-2 text-sm text-muted-foreground">
        {t(`${props.planId}_plan_description`)}
      </div>

      {props.button}

      <ul className="mt-8 space-y-3">{props.children}</ul>
    </div>
  );
};
