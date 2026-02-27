'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import { cn } from '@/utils/Helpers';

import { RsvpModal } from './RsvpModal';

type RsvpButtonProps = {
  eventSlug: string;
  eventTitle: string;
};

export function RsvpButton({ eventSlug, eventTitle }: RsvpButtonProps) {
  const t = useTranslations('GuestEvent');
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'min-h-[44px] min-w-[44px] rounded-xl px-5 font-nunito text-sm font-bold text-white',
          'outline-none transition-opacity hover:opacity-95',
          'focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary-dark)]',
        )}
        style={{ backgroundColor: 'var(--theme-primary)' }}
        aria-label={t('rsvp_button_aria', { title: eventTitle })}
      >
        {t('rsvp_now')}
      </button>
      <RsvpModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          triggerRef.current?.focus();
        }}
        eventSlug={eventSlug}
        eventTitle={eventTitle}
      />
    </>
  );
}
