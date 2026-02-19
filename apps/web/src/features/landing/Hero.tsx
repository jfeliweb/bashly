import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export async function Hero() {
  const t = await getTranslations('Index');

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cerulean-50 to-white dark:from-cerulean-950 dark:to-background py-20 sm:py-32">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cerulean-200/20 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-96 w-96 translate-x-1/2 rounded-full bg-fern-500/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {t('hero_headline_1')}{' '}
            <span className="text-cerulean-600 dark:text-cerulean-400">
              {t('hero_headline_2')}
            </span>{' '}
            {t('hero_headline_3')}
          </h1>

          <p className="mt-6 text-xl leading-8 text-muted-foreground">
            {t('hero_subtext')}
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-fern-500 px-8 py-3 text-base font-semibold text-cerulean-950 shadow-sm hover:bg-fern-600 focus:outline-none focus:ring-2 focus:ring-cerulean-500 focus:ring-offset-2 transition-colors outline-offset-3 [outline:3px_solid_var(--focus-ring)] focus:outline"
              aria-label={t('primary_cta')}
            >
              {t('primary_cta')}
            </Link>
            <Link
              href="#features"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-cerulean-300 bg-white px-8 py-3 text-base font-semibold text-cerulean-700 hover:bg-cerulean-50 focus:outline-none focus:ring-2 focus:ring-cerulean-500 focus:ring-offset-2 transition-colors dark:bg-cerulean-950 dark:border-cerulean-700 dark:text-cerulean-300 outline-offset-3 [outline:3px_solid_var(--focus-ring)] focus:outline"
              aria-label={t('secondary_cta')}
            >
              {t('secondary_cta')}
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {t('hero_disclaimer')}
          </p>
        </div>
      </div>
    </section>
  );
}
