'use client';

import { Calendar, Music, Sparkles, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

const features = [
  { icon: Users, titleKey: 'feature_rsvp_title', descKey: 'feature_rsvp_description' },
  { icon: Music, titleKey: 'feature_songs_title', descKey: 'feature_songs_description' },
  { icon: Calendar, titleKey: 'feature_schedule_title', descKey: 'feature_schedule_description' },
] as const;

type WelcomeScreenProps = { userName: string };

export function WelcomeScreen({ userName }: WelcomeScreenProps) {
  const t = useTranslations('Onboarding');
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  function handleGetStarted() {
    setDismissed(true);
    router.push('/dashboard/events/new');
  }

  function handleSkip() {
    setDismissed(true);
    router.push('/dashboard');
  }

  if (dismissed) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-heading"
    >
      <div className="mx-4 w-full max-w-2xl rounded-xl bg-white p-8 shadow-2xl dark:bg-cerulean-950">
        <div className="mb-6 flex items-center justify-center">
          <div className="rounded-full bg-fern-500 p-3">
            <Sparkles className="size-8 text-cerulean-950" aria-hidden />
          </div>
        </div>

        <h1 id="welcome-heading" className="text-center font-heading text-3xl font-bold text-foreground">
          {t('welcome_title', { name: userName })}
        </h1>
        <p className="mt-3 text-center text-lg text-muted-foreground">
          {t('welcome_subtitle')}
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.titleKey} className="text-center">
                <div className="mx-auto mb-3 inline-flex items-center justify-center rounded-lg bg-cerulean-100 p-3 dark:bg-cerulean-900">
                  <Icon className="size-6 text-cerulean-600 dark:text-cerulean-400" aria-hidden />
                </div>
                <h3 className="font-semibold text-foreground">{t(feature.titleKey)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(feature.descKey)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="min-h-[44px] rounded-[100px] bg-fern-500 font-bold text-cerulean-950 hover:bg-fern-600 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
          >
            {t('cta_first_event')}
          </Button>
          <Button
            onClick={handleSkip}
            variant="outline"
            size="lg"
            className="min-h-[44px] rounded-[100px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
          >
            {t('cta_later')}
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {t('hint_dashboard')}
        </p>
      </div>
    </div>
  );
}
