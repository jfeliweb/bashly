'use client';

import { useTranslations } from 'next-intl';

import { TitleBar } from '@/features/dashboard/TitleBar';

const OrganizationProfilePage = () => {
  const t = useTranslations('OrganizationProfile');

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          Organization settings will be available here.
        </p>
      </div>
    </>
  );
};

export default OrganizationProfilePage;
