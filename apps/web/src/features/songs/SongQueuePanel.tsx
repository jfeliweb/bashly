'use client';

import { Check, Music, ThumbsUp, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SongStatus = 'pending' | 'approved' | 'rejected';

type Song = {
  id: string;
  trackTitle: string;
  artistName: string;
  albumArtUrl: string | null;
  guestName: string;
  guestMessage: string | null;
  status: SongStatus;
  voteCount: number;
  createdAt: string;
};

type SongQueuePanelProps = {
  eventId: string;
};

export function SongQueuePanel({ eventId }: SongQueuePanelProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filter, setFilter] = useState<'all' | SongStatus>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    void loadSongs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, eventId]);

  async function loadSongs(): Promise<void> {
    setIsLoading(true);
    const res = await fetch(`/api/events/${eventId}/songs?status=${filter}`);
    if (!res.ok) {
      setSongs([]);
      setIsLoading(false);
      return;
    }
    const data: { songs?: Song[] } = await res.json();
    setSongs(data.songs ?? []);
    setIsLoading(false);
  }

  async function updateStatus(songId: string, status: Exclude<SongStatus, 'pending'>): Promise<void> {
    const res = await fetch(`/api/events/${eventId}/songs/${songId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      // eslint-disable-next-line no-alert
      alert('Failed to update song status');
      return;
    }

    void loadSongs();
  }

  async function deleteSong(songId: string): Promise<void> {
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm('Delete this song request?');
    if (!confirmed) {
      return;
    }

    const res = await fetch(`/api/events/${eventId}/songs/${songId}`, { method: 'DELETE' });
    if (!res.ok) {
      // eslint-disable-next-line no-alert
      alert('Failed to delete song');
      return;
    }
    void loadSongs();
  }

  async function bulkApproveAll(): Promise<void> {
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm('Approve all pending songs?');
    if (!confirmed) {
      return;
    }

    const res = await fetch(`/api/events/${eventId}/songs/bulk-approve`, { method: 'POST' });
    if (!res.ok) {
      // eslint-disable-next-line no-alert
      alert('Failed to bulk approve');
      return;
    }
    void loadSongs();
  }

  const pendingCount = songs.filter(s => s.status === 'pending').length;

  return (
    <section
      aria-labelledby="song-queue-heading"
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2
          id="song-queue-heading"
          className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground"
        >
          <Music aria-hidden className="size-5" />
          <span>Song Queue</span>
          <span className="font-mono text-xs font-semibold text-muted-foreground">
            (
            {songs.length}
            )
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <Select
            value={filter}
            onValueChange={value => setFilter(value as typeof filter)}
          >
            <SelectTrigger
              className="w-40"
              aria-label="Filter songs by status"
            >
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Songs</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          {pendingCount > 0 ? (
            <Button
              onClick={() => void bulkApproveAll()}
              variant="outline"
              className="min-h-[44px]"
            >
              <span>Approve All</span>
              <span className="ml-1 font-mono text-xs font-semibold">
                (
                {pendingCount}
                )
              </span>
            </Button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading songs...</p>
      ) : null}

      {!isLoading && songs.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <Music className="mx-auto mb-3 size-10 opacity-30" aria-hidden />
          <p className="text-sm">No song requests yet</p>
        </div>
      ) : null}

      {!isLoading && songs.length > 0 ? (
        <div className="space-y-3">
          {songs.map(song => (
            <div
              key={song.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
            >
              {song.albumArtUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={song.albumArtUrl}
                  alt=""
                  className="size-12 rounded object-cover"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-foreground">
                  {song.trackTitle}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {song.artistName}
                  {' · Requested by '}
                  {song.guestName}
                </div>
                {song.guestMessage ? (
                  <div className="mt-1 line-clamp-2 text-xs italic text-muted-foreground">
                    &quot;
                    {song.guestMessage}
                    &quot;
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1 text-sm text-muted-foreground"
                  title="Vote count"
                >
                  <ThumbsUp className="size-3" aria-hidden />
                  <span className="font-mono font-semibold">
                    {song.voteCount}
                  </span>
                </div>
                {song.status === 'pending' ? (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => void updateStatus(song.id, 'approved')}
                      aria-label="Approve song"
                      className="text-green-600"
                    >
                      <Check className="size-4" aria-hidden />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => void updateStatus(song.id, 'rejected')}
                      aria-label="Reject song"
                      className="text-red-600"
                    >
                      <X className="size-4" aria-hidden />
                    </Button>
                  </>
                ) : null}
                {song.status === 'approved' ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                    Approved
                  </span>
                ) : null}
                {song.status === 'rejected' ? (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-500/10 dark:text-red-300">
                    Rejected
                  </span>
                ) : null}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => void deleteSong(song.id)}
                  aria-label="Delete song"
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
