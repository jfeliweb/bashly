import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { BaseTemplate } from '@/templates/BaseTemplate';

export async function generateMetadata(props: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'TermsPage',
  });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function TermsPage(props: { params: { locale: string } }) {
  unstable_setRequestLocale(props.params.locale);
  const t = await getTranslations('TermsPage');
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <BaseTemplate>
      <div className="bg-white dark:bg-background">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              {t('last_updated', { date: lastUpdated })}
            </p>

            <div className="prose-cerulean mt-8 max-w-none">
              <h2>{t('s1_heading')}</h2>
              <p>{t('s1_p')}</p>

              <h2>{t('s2_heading')}</h2>
              <p>{t('s2_p')}</p>

              <h2>{t('s3_heading')}</h2>
              <p>{t('s3_p')}</p>
              <ul>
                <li>{t('s3_li1')}</li>
                <li>{t('s3_li2')}</li>
                <li>{t('s3_li3')}</li>
                <li>{t('s3_li4')}</li>
              </ul>

              <h2>{t('s4_heading')}</h2>
              <p>{t('s4_p')}</p>
              <ul>
                <li>{t('s4_li1')}</li>
                <li>{t('s4_li2')}</li>
                <li>{t('s4_li3')}</li>
                <li>{t('s4_li4')}</li>
                <li>{t('s4_li5')}</li>
                <li>{t('s4_li6')}</li>
              </ul>

              <h2>{t('s5_heading')}</h2>
              <p>
                <strong>
                  {t('s5_your_label')}
                  :
                </strong>
                {' '}
                {t('s5_your_text')}
              </p>
              <p>
                <strong>
                  {t('s5_third_label')}
                  :
                </strong>
                {' '}
                {t('s5_third_text')}
              </p>

              <h2>{t('s6_heading')}</h2>
              <p>
                {t.rich('s6_p', {
                  link: chunks => (
                    <Link
                      href="/privacy"
                      className="focus:outline-3 focus:outline-offset-3 text-cerulean-700 underline underline-offset-2 hover:text-cerulean-800 focus:outline focus:outline-[var(--focus-ring)]"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </p>

              <h2>{t('s7_heading')}</h2>
              <p>{t('s7_p')}</p>

              <h2>{t('s8_heading')}</h2>
              <p>
                {t.rich('s8_p', {
                  email: chunks => (
                    <a
                      href="mailto:hello@bashly.app"
                      className="focus:outline-3 focus:outline-offset-3 text-cerulean-700 underline underline-offset-2 hover:text-cerulean-800 focus:outline focus:outline-[var(--focus-ring)]"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </p>

              <h2>{t('s9_heading')}</h2>
              <p>{t('s9_p')}</p>

              <h2>{t('s10_heading')}</h2>
              <p>{t('s10_p')}</p>

              <h2>{t('s11_heading')}</h2>
              <p>{t('s11_p')}</p>

              <h2>{t('s12_heading')}</h2>
              <p>
                {t.rich('s12_p', {
                  email: chunks => (
                    <a
                      href="mailto:hello@bashly.app"
                      className="focus:outline-3 focus:outline-offset-3 text-cerulean-700 underline underline-offset-2 hover:text-cerulean-800 focus:outline focus:outline-[var(--focus-ring)]"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </p>

              <h2>{t('s13_heading')}</h2>
              <p>{t('s13_p')}</p>
            </div>
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
}
