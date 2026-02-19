import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { buttonVariants } from '@/components/ui/buttonVariants';
import { CenteredHero } from '@/features/landing/CenteredHero';
import { Section } from '@/features/landing/Section';

export const Hero = () => {
  const t = useTranslations('Hero');

  return (
    <Section className="py-36">
      <CenteredHero
        title={t('title')}
        description={t('description')}
        buttons={(
          <>
            <Link className={buttonVariants({ size: 'lg' })} href="/sign-up">
              {t('primary_button')}
            </Link>
            <Link
              className={buttonVariants({ variant: 'outline', size: 'lg' })}
              href="/sign-up"
            >
              {t('secondary_button')}
            </Link>
          </>
        )}
      />
    </Section>
  );
};
