'use client';

import * as Sentry from '@sentry/nextjs';
import { Music, ThumbsUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { logError } from '@/libs/sentryLogger';
import { cn } from '@/utils/Helpers';

type Song = {
  id: string;
  trackTitle: string;
  artistName: string;
  albumArtUrl: string | null;
  guestName: string;
  guestMessage: string | null;
  voteCount: number;
};

type SongVotingListProps = {
  eventSlug: string;
  votingEnabled: boolean;
};

function getFingerprint(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return btoa(
    [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
    ].join('|'),
  ).slice(0, 32);
}

export function SongVotingList({
  eventSlug,
  votingEnabled,
}: SongVotingListProps) {
  const t = useTranslations('SongVotingList');
  const [songs, setSongs] = useState<Song[]>([]);
  const [votedSongs, setVotedSongs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const fingerprintRef = useRef<string>('');

  useEffect(() => {
    fingerprintRef.current = getFingerprint();
  }, []);

  useEffect(() => {
    loadSongs();
    loadVotedSongs();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadSongs/loadVotedSongs depend on eventSlug and state; avoid stale closures
  }, [eventSlug]);

  async function loadSongs() {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/events/${eventSlug}/songs?status=approved`,
      );
      if (res.ok) {
        const data = await res.json();
        setSongs(data.songs ?? []);
      }
    } catch (err) {
      Sentry.captureException(err);
      logError('music', 'Music: failed to load songs', {
        eventSlug,
        error: err instanceof Error ? err.message : 'Unknown',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function loadVotedSongs() {
    if (typeof window === 'undefined') {
      return;
    }
    const key = `voted_songs_${eventSlug}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setVotedSongs(new Set(JSON.parse(stored) as string[]));
      } catch {
        setVotedSongs(new Set());
      }
    }
  }

  function saveVotedSong(songId: string, voted: boolean) {
    if (typeof window === 'undefined') {
      return;
    }
    const key = `voted_songs_${eventSlug}`;
    const updated = new Set(votedSongs);
    if (voted) {
      updated.add(songId);
    } else {
      updated.delete(songId);
    }
    setVotedSongs(updated);
    localStorage.setItem(key, JSON.stringify([...updated]));
  }

  async function handleVote(songId: string) {
    const hasVoted = votedSongs.has(songId);
    const fingerprint = fingerprintRef.current;
    if (!fingerprint) {
      return;
    }

    try {
      if (hasVoted) {
        const res = await fetch(
          `/api/events/${eventSlug}/songs/${songId}/vote`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fingerprint }),
          },
        );

        if (res.ok) {
          const data = (await res.json()) as { vote_count: number };
          updateSongVoteCount(songId, data.vote_count);
          saveVotedSong(songId, false);
        }
      } else {
        const res = await fetch(
          `/api/events/${eventSlug}/songs/${songId}/vote`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fingerprint }),
          },
        );

        if (res.ok) {
          const data = (await res.json()) as { vote_count: number };
          updateSongVoteCount(songId, data.vote_count);
          saveVotedSong(songId, true);
        } else if (res.status === 409) {
          saveVotedSong(songId, true);
        }
      }
    } catch {
      // eslint-disable-next-line no-alert
      alert(t('vote_error'));
    }
  }

  function updateSongVoteCount(songId: string, newCount: number) {
    setSongs(prev =>
      prev.map(song =>
        song.id === songId ? { ...song, voteCount: newCount } : song,
      ),
    );
  }

  if (!votingEnabled) {
    return null;
  }

  if (isLoading) {
    return (
      <p className="text-[var(--theme-text-muted)]">{t('loading')}</p>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="py-8 text-center">
        <Music
          className="mx-auto mb-3 size-12 opacity-30"
          aria-hidden
        />
        <p className="text-[var(--theme-text-muted)]">{t('empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--theme-text-muted)]">
        {t('heading')}
      </p>

      {songs.map((song, index) => {
        const hasVoted = votedSongs.has(song.id);

        return (
          <div
            key={song.id}
            className="flex items-center gap-3 rounded-lg border p-2.5"
            style={{
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <span className="w-4 text-center font-mono text-xs font-semibold text-[var(--theme-primary)]">
              {index + 1}
            </span>
            {song.albumArtUrl
              ? (
                  // eslint-disable-next-line @next/next/no-img-element -- external album art URL
                  <img
                    src={song.albumArtUrl}
                    alt=""
                    className="size-12 rounded object-cover"
                  />
                )
              : null}
            <div className="min-w-0 flex-1">
              <div
                className="truncate font-semibold"
                style={{ color: 'var(--theme-text)' }}
              >
                {song.trackTitle}
              </div>
              <div
                className="truncate text-sm"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                {song.artistName}
                {' · '}
                {t('suggested_by', { name: song.guestName })}
              </div>
            </div>

            <Button
              onClick={() => void handleVote(song.id)}
              variant={hasVoted ? 'default' : 'outline'}
              size="sm"
              className="flex min-h-[44px] items-center gap-1"
              aria-label={
                hasVoted
                  ? t('remove_vote_aria')
                  : t('vote_aria')
              }
            >
              <ThumbsUp
                className={cn('h-4 w-4', hasVoted && 'fill-current')}
                aria-hidden
              />
              <span className="font-mono text-sm font-semibold">
                {song.voteCount}
              </span>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
