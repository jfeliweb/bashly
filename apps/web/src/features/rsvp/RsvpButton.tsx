'use client';

import { useTranslations } from 'next-intl';

type RsvpButtonProps = {
  eventSlug: string;
  eventTitle: string;
};

export function RsvpButton({ eventSlug: _eventSlug, eventTitle }: RsvpButtonProps) {
  const t = useTranslations('GuestEvent');

  return (
    <button
      type="button"
      onClick={() => {
        console.log('RSVP modal coming in Step 7');
      }}
      className="min-h-[44px] min-w-[44px] rounded-[100px] px-8 font-nunito text-base font-bold text-white outline-none transition-opacity hover:opacity-95 focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary-dark)]"
      style={{ backgroundColor: 'var(--theme-primary)' }}
      aria-label={t('rsvp_button_aria', { title: eventTitle })}
    >
      {t('rsvp_now')}
    </button>
  );
}
