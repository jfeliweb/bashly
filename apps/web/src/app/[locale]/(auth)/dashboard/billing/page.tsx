import { and, desc, eq, isNull, ne, or } from 'drizzle-orm';
import { CreditCard, Sparkles, Zap } from 'lucide-react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { UnlockEventButton } from '@/features/billing/UnlockEventButton';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventTable } from '@/models/Schema';
import { PLAN_ID, PlanConfig } from '@/utils/AppConfig';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Billing',
  });
  return {
    title: t('title_bar'),
    description: t('title_bar_description'),
  };
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <CreditCard className="size-5" aria-hidden="true" />,
  celebration: <Sparkles className="size-5" aria-hidden="true" />,
  premium: <Zap className="size-5" aria-hidden="true" />,
  planner: <Zap className="size-5" aria-hidden="true" />,
};

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect('/sign-in');
  }

  const t = await getTranslations('Billing');

  const ownedEvents = await db
    .select({ id: eventTable.id, title: eventTable.title })
    .from(eventTable)
    .where(
      and(
        eq(eventTable.ownerId, session.user.id),
        or(isNull(eventTable.status), ne(eventTable.status, 'archived')),
      ),
    )
    .orderBy(desc(eventTable.eventDate));

  const visiblePlans = (Object.entries(PlanConfig) as [string, (typeof PlanConfig)[keyof typeof PlanConfig]][])
    .filter(([, plan]) => plan.visible !== false);

  const currentPlan = PlanConfig[PLAN_ID.FREE];

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      <div className="space-y-8">
        {/* Current Plan */}
        <section aria-labelledby="current-plan-heading">
          <h2
            id="current-plan-heading"
            className="mb-1 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]"
          >
            {t('current_section_title')}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {t('current_section_description')}
          </p>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-foreground">
                {PLAN_ICONS[PLAN_ID.FREE]}
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {currentPlan.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentPlan.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-bold text-foreground">
                $
                {currentPlan.price}
              </span>
              <button
                type="button"
                disabled
                aria-label={t('manage_subscription_button')}
                className="inline-flex min-h-[44px] cursor-not-allowed items-center rounded-[100px] border border-border bg-muted px-5 font-bold text-muted-foreground opacity-60"
              >
                {t('manage_subscription_button')}
              </button>
            </div>
          </div>
        </section>

        {/* Plan comparison */}
        <section aria-labelledby="plans-heading">
          <h2
            id="plans-heading"
            className="mb-1 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]"
          >
            Available Plans
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Choose the plan that fits your celebration needs.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visiblePlans.map(([planId, plan]) => {
              const isCurrentPlan = planId === PLAN_ID.FREE;
              const isCelebration = planId === PLAN_ID.CELEBRATION;
              return (
                <div
                  key={planId}
                  className={`flex flex-col rounded-xl border p-6 ${
                    isCurrentPlan
                      ? 'border-[rgb(81,255,0)] bg-card ring-1 ring-[rgb(81,255,0)]/40'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">
                      {PLAN_ICONS[planId]}
                    </span>
                    <span className="font-bold text-foreground">
                      {plan.name}
                    </span>
                    {isCurrentPlan && (
                      <span className="ml-auto inline-flex items-center rounded-full bg-[rgb(81,255,0)]/20 px-2 py-0.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-bold text-foreground">
                      $
                      {plan.price}
                    </span>
                    {plan.billing === 'monthly' && (
                      <span className="text-sm text-muted-foreground">/ mo</span>
                    )}
                    {plan.billing === 'per-event' && (
                      <span className="text-sm text-muted-foreground">/ event</span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.description}
                  </p>

                  <ul className="mt-4 grow space-y-2">
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg
                        className="size-4 shrink-0 text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                      {plan.features.activeEvents >= 999
                        ? 'Unlimited active events'
                        : `${plan.features.activeEvents} active event${plan.features.activeEvents !== 1 ? 's' : ''}`}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg
                        className="size-4 shrink-0 text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                      {plan.features.guestsPerEvent >= 999999
                        ? 'Unlimited guests'
                        : `Up to ${plan.features.guestsPerEvent} guests`}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg
                        className="size-4 shrink-0 text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                      {plan.features.songRequests >= 999999
                        ? 'Unlimited song requests'
                        : `${plan.features.songRequests} song requests`}
                    </li>
                    {plan.features.streamingExport && (
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg
                          className="size-4 shrink-0 text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                        Streaming export
                      </li>
                    )}
                  </ul>

                  <div className="mt-6">
                    {isCurrentPlan
                      ? (
                          <div className="flex min-h-[44px] items-center justify-center rounded-[100px] bg-muted font-bold text-muted-foreground">
                            Current Plan
                          </div>
                        )
                      : isCelebration
                        ? (
                            <UnlockEventButton events={ownedEvents} />
                          )
                        : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
