'use client';

import { ExternalLink, Music, RefreshCw } from 'lucide-react';
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
        setStatusMessage(`${data.message} — ${data.tracks_added} tracks added!`);
      } else {
        const error = await res.json();
        setStatusMessage(error.error || 'Export failed');
      }
    } catch {
      setStatusMessage('Failed to export playlist. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }

  if (!isSpotifyConnected) {
    return (
      <p className="text-sm text-muted-foreground">
        Connect Spotify to export your playlist
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        {playlistUrl ? (
          <RefreshCw className={`h-4 w-4 ${isExporting ? 'animate-spin' : ''}`} />
        ) : (
          <Music className="h-4 w-4" />
        )}
        {isExporting ? (
          'Exporting...'
        ) : playlistUrl ? (
          'Re-sync to Spotify'
        ) : (
          'Export to Spotify'
        )}
      </Button>

      {statusMessage && (
        <p className="text-xs text-muted-foreground">{statusMessage}</p>
      )}

      {playlistUrl && (
        <a
          href={playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-green-600 hover:underline"
        >
          Open Playlist on Spotify
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

