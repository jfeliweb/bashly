'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/Helpers';

type PublishEventButtonProps = {
  eventId: string;
  className?: string;
};

export function PublishEventButton({ eventId, className }: PublishEventButtonProps) {
  const t = useTranslations('EventDetail');
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    setError(null);
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? t('publish_error'));
        return;
      }
      router.refresh();
    } catch {
      setError(t('publish_error'));
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        onClick={handlePublish}
        disabled={isPublishing}
        className={cn(
          'min-h-[44px] rounded-[100px] bg-[rgb(81,255,0)] px-6 font-bold text-[rgb(9,21,27)] hover:bg-[rgb(65,204,0)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)] disabled:opacity-70',
          className,
        )}
        aria-label={t('publish_event_aria')}
      >
        {isPublishing ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            {t('publishing')}
          </>
        ) : (
          t('publish_event')
        )}
      </Button>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
