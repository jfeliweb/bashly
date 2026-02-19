import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { buttonVariants } from '@/components/ui/buttonVariants';
import { PricingInformation } from '@/features/billing/PricingInformation';
import { Section } from '@/features/landing/Section';
import { PLAN_ID } from '@/utils/AppConfig';

export const Pricing = () => {
  const t = useTranslations('Pricing');

  const signUpButton = (
    <Link
      className={buttonVariants({
        size: 'sm',
        className: 'mt-5 w-full',
      })}
      href="/sign-up"
    >
      {t('button_text')}
    </Link>
  );

  return (
    <Section
      subtitle={t('section_subtitle')}
      title={t('section_title')}
      description={t('section_description')}
    >
      <PricingInformation
        buttonList={{
          [PLAN_ID.FREE]: signUpButton,
          [PLAN_ID.CELEBRATION]: signUpButton,
          [PLAN_ID.PREMIUM]: signUpButton,
          [PLAN_ID.PLANNER]: signUpButton,
        }}
      />
    </Section>
  );
};
