'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { BashlyLogo } from '@/components/BashlyLogo';
import { SocialLoginPlaceholder } from '@/components/placeholders/SocialLoginPlaceholder';
import { SignUpForm } from '@/features/auth/SignUpForm';

const SignUpPage = () => {
  const t = useTranslations('SignUp');

  return (
    <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
      <div className="flex justify-center">
        <Link href="/" aria-label="Bashly home">
          <BashlyLogo className="text-2xl" />
        </Link>
      </div>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t('meta_title')}</h1>
        <p className="text-sm text-muted-foreground">{t('meta_description')}</p>
      </div>
      <SignUpForm />
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card px-2 text-gray-500 dark:text-gray-400">
              {t('or_continue_with')}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <SocialLoginPlaceholder provider="google" disabled={false} />
          {/* <SocialLoginPlaceholder provider="apple" disabled /> */}
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
