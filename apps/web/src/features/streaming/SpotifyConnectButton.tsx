'use client';

import { Music } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

type SpotifyConnectButtonProps = {
  isConnected: boolean;
  displayName?: string;
};

export function SpotifyConnectButton({
  isConnected,
  displayName,
}: SpotifyConnectButtonProps) {
  const t = useTranslations('Streaming');

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Music aria-hidden className="h-4 w-4 text-green-600" />
        <span>
          {t('connected_as', { displayName: displayName ?? '—' })}
        </span>
      </div>
    );
  }

  return (
    <Button
      onClick={() => {
        window.location.href = '/api/streaming/spotify/connect';
      }}
      variant="outline"
      className="flex items-center gap-2"
      aria-label={t('connect_button_aria')}
    >
      <Music aria-hidden className="size-4" />
      <span>{t('connect_button_label')}</span>
    </Button>
  );
}
