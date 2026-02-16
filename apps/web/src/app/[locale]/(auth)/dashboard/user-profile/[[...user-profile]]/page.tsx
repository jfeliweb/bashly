'use client';

import { useTranslations } from 'next-intl';

import { UserProfileForm } from '@/features/auth/UserProfileForm';
import { TitleBar } from '@/features/dashboard/TitleBar';

const UserProfilePage = () => {
  const t = useTranslations('UserProfile');

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />
      <UserProfileForm />
    </>
  );
};

export default UserProfilePage;
