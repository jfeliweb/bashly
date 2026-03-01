import type { Metadata } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { BaseTemplate } from '@/templates/BaseTemplate';

export async function generateMetadata(props: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'About',
  });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function AboutPage(props: { params: { locale: string } }) {
  unstable_setRequestLocale(props.params.locale);
  const t = await getTranslations('About');

  return (
    <BaseTemplate>
      <div className="bg-white dark:bg-background">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t('title')}
            </h1>

            <div className="mt-8 space-y-6 text-lg text-muted-foreground">
              <p>
                <strong className="text-foreground">{t('intro_strong')}</strong>
                {' '}
                {t('intro_rest')}
              </p>

              <p>{t('paragraph_2')}</p>

              <p>{t('paragraph_3')}</p>

              <h2 className="mt-12 text-2xl font-bold text-foreground">
                {t('mission_heading')}
              </h2>
              <p>{t('mission_text')}</p>

              <h2 className="mt-12 text-2xl font-bold text-foreground">
                {t('why_heading')}
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong className="text-foreground">
                    {t('why_guest_title')}
                    :
                  </strong>
                  {' '}
                  {t('why_guest_text')}
                </li>
                <li>
                  <strong className="text-foreground">
                    {t('why_music_title')}
                    :
                  </strong>
                  {' '}
                  {t('why_music_text')}
                </li>
                <li>
                  <strong className="text-foreground">
                    {t('why_free_title')}
                    :
                  </strong>
                  {' '}
                  {t('why_free_text')}
                </li>
                <li>
                  <strong className="text-foreground">
                    {t('why_care_title')}
                    :
                  </strong>
                  {' '}
                  {t('why_care_text')}
                </li>
              </ul>

              <div className="mt-12 rounded-lg bg-cerulean-50 p-8 dark:bg-cerulean-950/50">
                <h2 className="text-2xl font-bold text-foreground">
                  {t('contact_heading')}
                </h2>
                <p className="mt-4">{t('contact_intro')}</p>
                <p className="mt-2">
                  <a
                    href="mailto:hello@bashly.app"
                    className="focus:outline-3 focus:outline-offset-3 font-semibold text-cerulean-600 hover:text-cerulean-700 focus:outline focus:outline-[var(--focus-ring)] dark:text-cerulean-400"
                  >
                    hello@bashly.app
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
}
