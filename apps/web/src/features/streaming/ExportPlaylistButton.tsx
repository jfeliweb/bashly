'use client';

import { ExternalLink, Music, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

export function ExportPlaylistButton({
  eventId,
  isSpotifyConnected,
  existingPlaylistUrl,
}: {
  eventId: string;
  isSpotifyConnected: boolean;
  existingPlaylistUrl?: string | null;
}) {
  const t = useTranslations('Streaming');
  const [isExporting, setIsExporting] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(
    existingPlaylistUrl ?? null,
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleExport() {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/playlist/export`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setPlaylistUrl(data.playlist_url);
        setStatusMessage(
          t('tracks_added_success', {
            message: data.message,
            count: data.tracks_added,
          }),
        );
      } else {
        const error = await res.json();
        setStatusMessage(error.error ?? t('export_failed'));
      }
    } catch {
      setStatusMessage(t('export_error_generic'));
    } finally {
      setIsExporting(false);
    }
  }

  if (!isSpotifyConnected) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('connect_to_export')}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2"
        aria-label={
          playlistUrl ? t('resync_to_spotify') : t('export_to_spotify')
        }
      >
        {playlistUrl
          ? (
              <RefreshCw
                className={`size-4 ${isExporting ? 'animate-spin' : ''}`}
                aria-hidden
              />
            )
          : (
              <Music className="size-4" aria-hidden />
            )}
        {isExporting
          ? (
              t('exporting')
            )
          : playlistUrl
            ? (
                t('resync_to_spotify')
              )
            : (
                t('export_to_spotify')
              )}
      </Button>

      {statusMessage && (
        <p className="text-xs text-muted-foreground" role="status">
          {statusMessage}
        </p>
      )}

      {playlistUrl && (
        <a
          href={playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-[rgb(48,153,0)] hover:underline dark:text-[rgb(116,255,51)]"
          aria-label={t('open_playlist_aria')}
        >
          {t('open_playlist')}
          <ExternalLink className="size-3" aria-hidden />
        </a>
      )}
    </div>
  );
}
