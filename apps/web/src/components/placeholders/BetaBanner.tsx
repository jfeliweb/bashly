'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function BetaBanner() {
  const t = useTranslations('BetaBanner');
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative rounded-lg bg-cerulean-50 p-4 dark:bg-cerulean-950/50">
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-2 top-2 text-cerulean-600 hover:text-cerulean-700 dark:text-cerulean-400 outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
        aria-label={t('dismiss_aria')}
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
      <p className="text-sm text-cerulean-900 dark:text-cerulean-100">
        <strong>{t('beta_note_title')}</strong>
        {' '}
        {t('beta_note_message')}
      </p>
    </div>
  );
}
