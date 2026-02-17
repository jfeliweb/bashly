import { z } from 'zod';

export const songStatusSchema = z.enum(['pending', 'approved', 'rejected']);

export const submitSongSchema = z.object({
  itunes_track_id: z.string().min(1),
  track_title:     z.string().min(1).max(200),
  artist_name:     z.string().min(1).max(200),
  album_name:      z.string().max(200).optional(),
  album_art_url:   z.string().url().optional(),
  isrc:            z.string().optional(),
  guest_message:   z.string().max(300).optional(),
  guest_name:      z.string().min(1).max(100),
  fingerprint:     z.string().optional(),
});

export const updateSongStatusSchema = z.object({
  status:      songStatusSchema,
  sort_order:  z.number().int().min(0).optional(),
});

export const voteSongSchema = z.object({
  fingerprint: z.string().min(1),
});

export const streamingPlatformSchema = z.enum(['spotify', 'apple_music']);

export const spotifyAuthCallbackSchema = z.object({
  code:  z.string().min(1),
  state: z.string().min(1),
});

export type SubmitSongInput          = z.infer<typeof submitSongSchema>;
export type UpdateSongStatusInput    = z.infer<typeof updateSongStatusSchema>;
export type VoteSongInput            = z.infer<typeof voteSongSchema>;
export type StreamingPlatform        = z.infer<typeof streamingPlatformSchema>;
export type SpotifyAuthCallbackInput = z.infer<typeof spotifyAuthCallbackSchema>;
