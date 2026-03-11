'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PromoCodeInput } from '@/features/billing/PromoCodeInput';

type UnlockEventButtonProps = {
  events: { id: string; title: string; paymentStatus?: string | null }[];
};

export function UnlockEventButton({ events }: UnlockEventButtonProps) {
  const t = useTranslations('Billing');
  const searchParams = useSearchParams();
  const prefillCode = searchParams.get('promo') ?? undefined;
  const firstLockedEventId = events.find(e => e.paymentStatus !== 'paid')?.id ?? '';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>(firstLockedEventId);
  const validSelectedId = events.some(e => e.id === selectedEventId && e.paymentStatus !== 'paid')
    ? selectedEventId
    : firstLockedEventId;
  const [activePromoCode, setActivePromoCode] = useState<string | undefined>();

  if (events.length === 0) {
    return (
      <p
        className="flex min-h-[44px] items-center justify-center rounded-[100px] bg-muted px-4 text-center text-sm font-medium text-muted-foreground"
        role="status"
      >
        {t('no_event_to_unlock')}
      </p>
    );
  }

  if (firstLockedEventId === '') {
    return (
      <p
        className="flex min-h-[44px] items-center justify-center rounded-[100px] bg-[rgb(81,255,0)]/10 px-4 text-center text-sm font-bold text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]"
        role="status"
        aria-label={t('no_locked_events')}
      >
        {`✓ ${t('all_events_unlocked')}`}
      </p>
    );
  }

  const handleUnlock = async () => {
    if (!validSelectedId) {
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: validSelectedId,
          ...(activePromoCode ? { promoCode: activePromoCode } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to create checkout');
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Select
        value={validSelectedId}
        onValueChange={(eventId) => {
          setSelectedEventId(eventId);
          setActivePromoCode(undefined);
        }}
        disabled={isLoading}
      >
        <SelectTrigger
          aria-label={t('select_event_label')}
          className="min-h-[44px] rounded-[100px]"
        >
          <SelectValue placeholder={t('select_event_placeholder')} />
        </SelectTrigger>
        <SelectContent>
          {events
            .filter(event => event.paymentStatus !== 'paid')
            .map(event => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      <PromoCodeInput
        key={validSelectedId}
        eventId={validSelectedId}
        prefillCode={prefillCode}
        onValidated={setActivePromoCode}
        onCleared={() => setActivePromoCode(undefined)}
      />
      <Button
        type="button"
        onClick={handleUnlock}
        disabled={isLoading}
        aria-label={
          activePromoCode
            ? t('unlock_event_button_with_promo')
            : t('unlock_event_button')
        }
        className="min-h-[44px] w-full rounded-[100px] bg-[rgb(81,255,0)] font-bold text-[rgb(9,21,27)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--focus-ring)]"
      >
        {isLoading
          ? t('unlock_loading')
          : activePromoCode
            ? t('unlock_event_button_with_promo')
            : t('unlock_event_button')}
      </Button>
    </div>
  );
}
