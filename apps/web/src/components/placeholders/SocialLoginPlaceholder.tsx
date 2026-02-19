'use client';

import { Apple, Chrome } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ComingSoonBadge } from '@/components/placeholders/ComingSoonBadge';
import { cn } from '@/utils/Helpers';

type SocialLoginPlaceholderProps = {
  provider: 'google' | 'apple';
  disabled?: boolean;
};

export function SocialLoginPlaceholder({
  provider,
  disabled = true,
}: SocialLoginPlaceholderProps) {
  const t = useTranslations('SocialLoginPlaceholder');

  const config = {
    google: {
      icon: Chrome,
      labelKey: 'continue_google' as const,
      bgColor: 'bg-white dark:bg-cerulean-950',
      borderColor: 'border-gray-300 dark:border-cerulean-700',
      textColor: 'text-gray-700 dark:text-gray-300',
    },
    apple: {
      icon: Apple,
      labelKey: 'continue_apple' as const,
      bgColor: 'bg-black dark:bg-white',
      borderColor: 'border-black dark:border-white',
      textColor: 'text-white dark:text-black',
    },
  };

  const { icon: Icon, labelKey, bgColor, borderColor, textColor } =
    config[provider];
  const label = t(labelKey);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-label={label}
        className={cn(
          'relative flex w-full items-center justify-center gap-3 rounded-[100px] border px-4 py-2.5 text-sm font-semibold transition-colors outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
          borderColor,
          bgColor,
          textColor,
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'hover:opacity-90'
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
        <span>{label}</span>
      </button>
      {disabled && (
        <span className="absolute -right-2 -top-2">
          <ComingSoonBadge />
        </span>
      )}
    </div>
  );
}
