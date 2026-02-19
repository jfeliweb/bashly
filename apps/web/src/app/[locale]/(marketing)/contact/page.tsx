import type { Metadata } from 'next';
import { Mail, MessageSquare, Bug } from 'lucide-react';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { BaseTemplate } from '@/templates/BaseTemplate';

export async function generateMetadata(props: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'ContactPage',
  });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function ContactPage(props: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(props.params.locale);
  const t = await getTranslations('ContactPage');

  return (
    <BaseTemplate>
      <div className="bg-white dark:bg-background">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-heading text-center text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-4 text-center text-lg text-muted-foreground">
              {t('intro')}
            </p>

            <div className="mt-16 grid gap-8 sm:grid-cols-3">
              <div className="rounded-xl border border-cerulean-200 bg-white p-6 text-center dark:border-cerulean-800 dark:bg-cerulean-950">
                <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-lg bg-cerulean-100 p-3 dark:bg-cerulean-900">
                  <Mail
                    className="h-6 w-6 text-cerulean-600 dark:text-cerulean-400"
                    aria-hidden
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {t('general_heading')}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('general_desc')}
                </p>
                <a
                  href="mailto:hello@bashly.app"
                  className="mt-4 inline-block font-semibold text-cerulean-600 hover:text-cerulean-700 dark:text-cerulean-400 focus:outline focus:outline-3 focus:outline-[var(--focus-ring)] focus:outline-offset-3"
                >
                  {t('general_email')}
                </a>
              </div>

              <div className="rounded-xl border border-cerulean-200 bg-white p-6 text-center dark:border-cerulean-800 dark:bg-cerulean-950">
                <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-lg bg-cerulean-100 p-3 dark:bg-cerulean-900">
                  <MessageSquare
                    className="h-6 w-6 text-cerulean-600 dark:text-cerulean-400"
                    aria-hidden
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {t('support_heading')}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('support_desc')}
                </p>
                <a
                  href="mailto:support@bashly.app"
                  className="mt-4 inline-block font-semibold text-cerulean-600 hover:text-cerulean-700 dark:text-cerulean-400 focus:outline focus:outline-3 focus:outline-[var(--focus-ring)] focus:outline-offset-3"
                >
                  {t('support_email')}
                </a>
              </div>

              <div className="rounded-xl border border-cerulean-200 bg-white p-6 text-center dark:border-cerulean-800 dark:bg-cerulean-950">
                <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-lg bg-cerulean-100 p-3 dark:bg-cerulean-900">
                  <Bug
                    className="h-6 w-6 text-cerulean-600 dark:text-cerulean-400"
                    aria-hidden
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {t('bugs_heading')}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('bugs_desc')}
                </p>
                <a
                  href="mailto:bugs@bashly.app"
                  className="mt-4 inline-block font-semibold text-cerulean-600 hover:text-cerulean-700 dark:text-cerulean-400 focus:outline focus:outline-3 focus:outline-[var(--focus-ring)] focus:outline-offset-3"
                >
                  {t('bugs_email')}
                </a>
              </div>
            </div>

            <div className="mt-16 rounded-xl bg-cerulean-50 p-8 dark:bg-cerulean-950/50">
              <h2 className="text-2xl font-bold text-foreground">
                {t('beta_heading')}
              </h2>
              <p className="mt-4 text-muted-foreground">{t('beta_p1')}</p>
              <p className="mt-4 text-muted-foreground">
                <strong className="text-foreground">{t('response_label')}</strong>{' '}
                {t('beta_p2')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
}
