import {
  Calendar,
  Music,
  QrCode,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';

const featureKeys = [
  { key: 'guest', icon: Users },
  { key: 'songs', icon: Music },
  { key: 'invites', icon: QrCode },
  { key: 'spotify', icon: Sparkles },
  { key: 'schedule', icon: Calendar },
  { key: 'registry', icon: Share2 },
] as const;

export async function Features() {
  const t = await getTranslations('Features');

  return (
    <section
      id="features"
      className="bg-white py-24 dark:bg-background sm:py-32"
      aria-labelledby="features-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="features-heading"
            className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            {t('landing_section_title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('landing_section_description')}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="relative rounded-xl border border-cerulean-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-cerulean-800 dark:bg-cerulean-950"
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-cerulean-100 p-3 dark:bg-cerulean-900">
                <Icon
                  className="size-6 text-cerulean-600 dark:text-cerulean-400"
                  aria-hidden
                />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {t(`feature_${key}_title`)}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`feature_${key}_description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
