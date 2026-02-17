import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

type iTunesTrack = {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  trackTimeMillis: number;
  previewUrl: string;
};

type iTunesResponse = {
  resultCount: number;
  results: iTunesTrack[];
};

function getSearchTerm(searchParams: URLSearchParams): string | null {
  const term = searchParams.get('term');
  if (term) return term;
  // Fallback: some clients send ?term%3Dvalue (whole "term=value" encoded as param name)
  const first = Array.from(searchParams.entries())[0];
  if (!first) return null;
  const [key, value] = first;
  const decodedKey = decodeURIComponent(key);
  if (decodedKey.startsWith('term=')) return decodedKey.slice(5).trim();
  if (value) return value.trim();
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const term = getSearchTerm(searchParams);

  if (!term || term.length < 2) {
    return NextResponse.json(
      { error: 'Search term must be at least 2 characters' },
      { status: 400 },
    );
  }

  try {
    const encodedTerm = encodeURIComponent(term.trim());
    const url = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=song&limit=20`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'iTunes API error', code: 'ITUNES_ERROR' },
        { status: response.status },
      );
    }

    const data: iTunesResponse = await response.json();

    // Transform to our format
    const tracks = data.results.map(track => ({
      itunes_track_id: String(track.trackId),
      track_title: track.trackName,
      artist_name: track.artistName,
      album_name: track.collectionName,
      album_art_url: track.artworkUrl100.replace('100x100', '300x300'), // Higher res
      duration_ms: track.trackTimeMillis,
      preview_url: track.previewUrl,
    }));

    return NextResponse.json({
      results: tracks,
      count: tracks.length,
    });
  } catch (error) {
    console.error('[iTunes Search Error]', error);
    return NextResponse.json(
      { error: 'Failed to search iTunes', code: 'SEARCH_FAILED' },
      { status: 500 },
    );
  }
}
