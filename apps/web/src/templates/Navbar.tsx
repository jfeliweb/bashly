import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { CenteredMenu } from '@/features/landing/CenteredMenu';
import { Section } from '@/features/landing/Section';

export const Navbar = () => {
  const t = useTranslations('Navbar');

  return (
    <Section className="px-3 py-6">
      <CenteredMenu
        logoLinkAriaLabel="Bashly home"
        logo={(
          <span className="flex items-center">
            <Image
              src="/logos/wordmark-light-bg.svg"
              alt="Bashly"
              width={140}
              height={32}
              className="h-8 w-auto dark:hidden"
            />
            <Image
              src="/logos/wordmark-dark-bg.svg"
              alt="Bashly"
              width={140}
              height={32}
              className="hidden h-8 w-auto dark:block"
            />
          </span>
        )}
        rightMenu={(
          <>
            {/* PRO: Dark mode toggle button */}
            <li data-fade>
              <LocaleSwitcher />
            </li>
            <li className="ml-1 mr-2.5" data-fade>
              <Link href="/sign-in">{t('sign_in')}</Link>
            </li>
            <li>
              <Link className={buttonVariants()} href="/sign-up">
                {t('sign_up')}
              </Link>
            </li>
          </>
        )}
      >
        <li>
          <Link href="/features">{t('features')}</Link>
        </li>
        {/* <li>
          <Link href="/pricing">{t('pricing')}</Link>
        </li> */}
        <li>
          <Link href="/about">{t('about')}</Link>
        </li>
      </CenteredMenu>
    </Section>
  );
};
