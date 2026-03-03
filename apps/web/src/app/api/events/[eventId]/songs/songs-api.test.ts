import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@/libs/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/libs/DB', () => ({
  db: {
    query: {
      eventRoleTable: {
        findFirst: vi.fn(),
      },
      eventTable: {
        findFirst: vi.fn(),
      },
    },
    select: vi.fn(),
  },
}));

const { auth } = await import('@/libs/auth');
const { db } = await import('@/libs/DB');

const EVENT_A_ID = '11111111-1111-4111-8111-111111111111';
const EVENT_B_ID = '22222222-2222-4222-8222-222222222222';

function createGetRequest(url: string): NextRequest {
  return new Request(url, { method: 'GET' }) as unknown as NextRequest;
}

type MockSong = {
  id: string;
  eventId: string;
  status: 'pending' | 'approved' | 'rejected';
};

function mockSongSelectBuilder(eventSongs: MockSong[], mixedSongs: MockSong[]): {
  where: ReturnType<typeof vi.fn>;
  orderBy: ReturnType<typeof vi.fn>;
  $dynamic: ReturnType<typeof vi.fn>;
} {
  let whereCallCount = 0;

  const queryBuilder = {
    where: vi.fn(),
    orderBy: vi.fn(),
    $dynamic: vi.fn(),
  };

  queryBuilder.where.mockImplementation(() => {
    whereCallCount += 1;
    return queryBuilder;
  });
  queryBuilder.$dynamic.mockReturnValue(queryBuilder);
  queryBuilder.orderBy.mockImplementation(async () => {
    // Regression trap: older implementation called `.where(...)` twice when status != all,
    // which made this return mixed cross-event songs in this mock.
    return whereCallCount > 1 ? mixedSongs : eventSongs;
  });

  vi.mocked(db.select).mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: queryBuilder.where,
    }),
  } as never);

  return queryBuilder;
}

describe('GET /api/events/[eventId]/songs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as never);
    vi.mocked(db.query.eventRoleTable.findFirst).mockResolvedValue({
      eventId: EVENT_A_ID,
      userId: 'user-1',
      role: 'owner',
    } as never);
  });

  it('keeps approved filter scoped to the current event', async () => {
    const eventSongs: MockSong[] = [
      { id: 'song-a1', eventId: EVENT_A_ID, status: 'approved' },
      { id: 'song-a2', eventId: EVENT_A_ID, status: 'approved' },
    ];
    const mixedSongs: MockSong[] = [
      ...eventSongs,
      { id: 'song-b1', eventId: EVENT_B_ID, status: 'approved' },
    ];

    const queryBuilder = mockSongSelectBuilder(eventSongs, mixedSongs);
    const req = createGetRequest(`http://localhost/api/events/${EVENT_A_ID}/songs?status=approved`);

    const res = await GET(req, { params: Promise.resolve({ eventId: EVENT_A_ID }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.songs).toEqual(eventSongs);
    expect(queryBuilder.where).toHaveBeenCalledTimes(1);
  });

  it('keeps all-songs filter scoped to the current event', async () => {
    const eventSongs: MockSong[] = [
      { id: 'song-a1', eventId: EVENT_A_ID, status: 'approved' },
      { id: 'song-a3', eventId: EVENT_A_ID, status: 'pending' },
    ];
    const mixedSongs: MockSong[] = [
      ...eventSongs,
      { id: 'song-b2', eventId: EVENT_B_ID, status: 'pending' },
    ];

    const queryBuilder = mockSongSelectBuilder(eventSongs, mixedSongs);
    const req = createGetRequest(`http://localhost/api/events/${EVENT_A_ID}/songs?status=all`);

    const res = await GET(req, { params: Promise.resolve({ eventId: EVENT_A_ID }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.songs).toEqual(eventSongs);
    expect(queryBuilder.where).toHaveBeenCalledTimes(1);
  });

  it('returns 400 for an invalid status filter', async () => {
    const req = createGetRequest(`http://localhost/api/events/${EVENT_A_ID}/songs?status=invalid`);

    const res = await GET(req, { params: Promise.resolve({ eventId: EVENT_A_ID }) });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid status filter');
    expect(db.select).not.toHaveBeenCalled();
  });
});
