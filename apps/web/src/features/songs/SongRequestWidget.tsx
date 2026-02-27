'use client';

import { Music, Search, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type iTunesTrack = {
  itunes_track_id: string;
  track_title: string;
  artist_name: string;
  album_name: string;
  album_art_url: string;
};

type SongRequestWidgetProps = {
  eventSlug: string;
  songRequestsEnabled: boolean;
  songRequestsPerGuest: number;
};

export function SongRequestWidget({
  eventSlug,
  songRequestsEnabled,
  songRequestsPerGuest,
}: SongRequestWidgetProps) {
  const t = useTranslations('SongRequestWidget');
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<iTunesTrack[]>([]);
  const [selectedSong, setSelectedSong] = useState<iTunesTrack | null>(null);
  const [guestName, setGuestName] = useState('');
  const [message, setMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!songRequestsEnabled) {
    return null;
  }

  async function handleSearch() {
    if (searchTerm.trim().length < 2) {
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/songs/search?term=${encodeURIComponent(searchTerm)}`,
      );
      const data = await res.json();
      setResults(data.results ?? []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSubmit() {
    if (!selectedSong || !guestName.trim()) {
      return;
    }

    setIsSubmitting(true);
    const fingerprint = btoa(
      [
        navigator.userAgent,
        navigator.language,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
      ].join('|'),
    ).slice(0, 32);

    try {
      const res = await fetch(`/api/events/${eventSlug}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itunes_track_id: selectedSong.itunes_track_id,
          track_title: selectedSong.track_title,
          artist_name: selectedSong.artist_name,
          album_name: selectedSong.album_name,
          album_art_url: selectedSong.album_art_url,
          guest_message: message,
          guest_name: guestName,
          fingerprint,
        }),
      });

      if (res.ok) {
        setSubmitError(null);
        setShowSuccess(true);
        setSelectedSong(null);
        setSearchTerm('');
        setResults([]);
        setMessage('');
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        const error = await res.json();
        setSubmitError(error.error ?? t('submit_error'));
      }
    } catch {
      setSubmitError(t('submit_error_network'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (showSuccess) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ backgroundColor: 'var(--theme-surface-raised)' }}
      >
        <div className="mb-3 text-5xl" aria-hidden>
          🎵
        </div>
        <h3
          className="mb-2 text-xl font-bold"
          style={{ color: 'var(--theme-text)' }}
        >
          {t('success_heading')}
        </h3>
        <p style={{ color: 'var(--theme-text-muted)' }}>
          {t('success_subtext')}
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border p-3"
      style={{
        background: 'linear-gradient(135deg, var(--theme-primary-light), var(--theme-surface))',
        borderColor: 'var(--theme-border)',
      }}
    >
      <h3
        className="mb-2 flex items-center gap-2 text-base font-bold"
        style={{ color: 'var(--theme-text)' }}
      >
        <Music aria-hidden />
        {t('heading')}
      </h3>
      <p className="mb-3 font-nunito text-xs text-[var(--theme-text-muted)]">{t('subheading')}</p>

      {!selectedSong
        ? (
            <>
              <div className="mb-4 flex gap-2">
                <Input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder={t('search_placeholder')}
                  aria-label={t('search_aria')}
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  aria-label={t('search_button_aria')}
                  className="rounded-xl"
                >
                  <Search />
                </Button>
              </div>

              {results.length > 0 && (
                <div className="mb-3 max-h-96 space-y-1 overflow-y-auto rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2">
                  {results.map(track => (
                    <button
                      key={track.itunes_track_id}
                      type="button"
                      onClick={() => {
                        setSubmitError(null);
                        setSelectedSong(track);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- external album art URL */}
                      <img
                        src={track.album_art_url}
                        alt=""
                        className="size-12 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          className="truncate font-semibold"
                          style={{ color: 'var(--theme-text)' }}
                        >
                          {track.track_title}
                        </div>
                        <div
                          className="truncate text-sm"
                          style={{ color: 'var(--theme-text-muted)' }}
                        >
                          {track.artist_name}
                          {' · '}
                          {track.album_name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )
        : (
            <>
              <div
                className="mb-4 flex items-center gap-3 rounded-lg p-3"
                style={{ backgroundColor: 'var(--theme-surface)' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- external album art URL */}
                <img
                  src={selectedSong.album_art_url}
                  alt=""
                  className="size-16 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div
                    className="font-bold"
                    style={{ color: 'var(--theme-text)' }}
                  >
                    {selectedSong.track_title}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    {selectedSong.artist_name}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedSong(null)}
                  aria-label={t('change_song_aria')}
                >
                  {t('change_button')}
                </Button>
              </div>

              <Input
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder={t('your_name_placeholder')}
                aria-label={t('your_name_aria')}
                className="mb-3"
                required
              />

              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={t('message_placeholder')}
                aria-label={t('message_aria')}
                className="mb-4"
                maxLength={300}
              />

              {submitError && (
                <p
                  className="mb-3 text-sm"
                  style={{ color: 'var(--theme-text-muted)' }}
                  role="alert"
                >
                  {submitError}
                </p>
              )}

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !guestName.trim()}
                className="w-full"
                style={{
                  backgroundColor: 'var(--theme-primary)',
                  color: '#fff',
                }}
              >
                <Send className="mr-2" />
                {isSubmitting ? t('submitting') : t('submit_button')}
              </Button>
            </>
          )}

      {songRequestsPerGuest > 0 && (
        <p
          className="mt-2 text-center text-xs"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          {songRequestsPerGuest === 1
            ? t('limit_hint', { count: 1 })
            : t('limit_hint_plural', { count: songRequestsPerGuest })}
        </p>
      )}
    </div>
  );
}
