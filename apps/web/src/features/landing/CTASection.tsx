import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function CTASection() {
  const t = await getTranslations('CTA');

  return (
    <section
      className="bg-gradient-to-r from-cerulean-600 to-cerulean-700 py-16 dark:from-cerulean-800 dark:to-cerulean-900 sm:py-24"
      aria-labelledby="cta-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="cta-heading"
            className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-cerulean-100">
            {t('section_description')}
          </p>
          <div className="mt-10">
            <Link
              href="/sign-up"
              className="outline-offset-3 inline-flex min-h-[44px] items-center justify-center rounded-full bg-fern-500 px-8 py-3 text-base font-semibold text-cerulean-950 shadow-lg transition-colors [outline:3px_solid_var(--focus-ring)] hover:bg-fern-600 focus:outline-none focus:outline focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-cerulean-700"
              aria-label={t('button_text')}
            >
              {t('button_text')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
