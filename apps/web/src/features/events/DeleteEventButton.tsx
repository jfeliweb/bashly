'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

type DeleteEventButtonProps = {
  eventId: string;
};

export function DeleteEventButton({ eventId }: DeleteEventButtonProps) {
  const router = useRouter();
  const t = useTranslations('EventDetail');
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data?.error as string) ?? 'Failed to delete event');
      }
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : t('delete_event_error');
      setError(message);
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {confirming
        ? (
            <>
              <span className="text-sm text-muted-foreground">
                {t('delete_event_confirm_title')}
              </span>
              <span className="basis-full text-sm text-muted-foreground">
                {t('delete_event_confirm_description')}
              </span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="min-h-[44px] font-semibold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
                onClick={() => void handleDelete()}
                disabled={loading}
              >
                {loading ? t('delete_event_deleting') : t('delete_event_confirm')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-[44px] font-semibold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
                onClick={() => {
                  setConfirming(false);
                  setError(null);
                }}
                disabled={loading}
              >
                {t('delete_event_cancel')}
              </Button>
            </>
          )
        : (
            <Button
              type="button"
              variant="destructive"
              className="min-h-[44px] font-semibold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
              onClick={() => {
                setConfirming(true);
                setError(null);
              }}
              aria-label={t('delete_event_aria')}
            >
              {t('delete_event')}
            </Button>
          )}
      {error && (
        <span role="status" className="text-sm text-destructive">
          {error}
        </span>
      )}
    </span>
  );
}
