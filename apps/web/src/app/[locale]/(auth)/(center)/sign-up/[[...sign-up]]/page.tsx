'use client';

import { useTranslations } from 'next-intl';

import { SignUpForm } from '@/features/auth/SignUpForm';

const SignUpPage = () => {
  const t = useTranslations('SignUp');

  return (
    <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t('meta_title')}</h1>
        <p className="text-sm text-muted-foreground">{t('meta_description')}</p>
      </div>
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;
