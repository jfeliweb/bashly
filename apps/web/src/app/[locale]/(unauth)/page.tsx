import type { Metadata } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { CTASection } from '@/features/landing/CTASection';
import { EventShowcase } from '@/features/landing/EventShowcase';
import { Features } from '@/features/landing/Features';
import { Hero } from '@/features/landing/Hero';
import { HowItWorks } from '@/features/landing/HowItWorks';
import { BaseTemplate } from '@/templates/BaseTemplate';

export async function generateMetadata(props: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Index',
  });

  const title = t('meta_title');
  const description = t('meta_description');

  return {
    title,
    description,
    openGraph: {
      title,
      description:
        'Plan Sweet 16s, graduations, and celebrations with RSVP management, song requests, and streaming playlist export.',
      type: 'website',
    },
  };
}

const IndexPage = async (props: { params: { locale: string } }) => {
  unstable_setRequestLocale(props.params.locale);

  return (
    <BaseTemplate>
      <Hero />
      <Features />
      <HowItWorks />
      <EventShowcase />
      <CTASection />
    </BaseTemplate>
  );
};

export default IndexPage;
