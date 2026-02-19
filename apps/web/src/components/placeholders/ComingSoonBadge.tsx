'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/utils/Helpers';

type ComingSoonBadgeProps = {
  className?: string;
};

export function ComingSoonBadge({ className = '' }: ComingSoonBadgeProps) {
  const t = useTranslations('SocialLoginPlaceholder');

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-fern-500 px-2 py-0.5 text-xs font-semibold text-cerulean-950',
        className
      )}
    >
      {t('coming_soon')}
    </span>
  );
}
