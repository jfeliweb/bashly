import { voteSongSchema } from '@saas/validators';
import { and, eq, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import {
  eventTable,
  songSuggestionTable,
  songVoteTable,
} from '@/models/Schema';

type RouteParams = { params: Promise<{ eventId: string; songId: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { eventId: slug, songId } = await params;

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.slug, slug),
    columns: { id: true, status: true, songVotingEnabled: true },
  });

  if (!event || event.status !== 'published') {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (!event.songVotingEnabled) {
    return NextResponse.json(
      { error: 'Voting is disabled for this event' },
      { status: 403 },
    );
  }

  const song = await db.query.songSuggestionTable.findFirst({
    where: and(
      eq(songSuggestionTable.id, songId),
      eq(songSuggestionTable.eventId, event.id),
    ),
  });

  if (!song) {
    return NextResponse.json({ error: 'Song not found' }, { status: 404 });
  }

  const body = await req.json();
  const parsed = voteSongSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error },
      { status: 400 },
    );
  }

  const { fingerprint } = parsed.data;

  const existingVote = await db.query.songVoteTable.findFirst({
    where: and(
      eq(songVoteTable.songSuggestionId, songId),
      eq(songVoteTable.fingerprint, fingerprint),
    ),
  });

  if (existingVote) {
    return NextResponse.json(
      { error: 'You already voted for this song', code: 'ALREADY_VOTED' },
      { status: 409 },
    );
  }

  await db.insert(songVoteTable).values({
    songSuggestionId: songId,
    fingerprint,
  });

  await db
    .update(songSuggestionTable)
    .set({
      voteCount: sql`${songSuggestionTable.voteCount} + 1`,
    })
    .where(eq(songSuggestionTable.id, songId));

  const updated = await db.query.songSuggestionTable.findFirst({
    where: eq(songSuggestionTable.id, songId),
    columns: { voteCount: true },
  });

  return NextResponse.json({
    message: 'Vote recorded',
    vote_count: updated?.voteCount ?? 0,
  });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { eventId: slug, songId } = await params;

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.slug, slug),
    columns: { id: true, status: true, songVotingEnabled: true },
  });

  if (!event || event.status !== 'published') {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const body = await req.json();
  const parsed = voteSongSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 400 },
    );
  }

  const { fingerprint } = parsed.data;

  const vote = await db.query.songVoteTable.findFirst({
    where: and(
      eq(songVoteTable.songSuggestionId, songId),
      eq(songVoteTable.fingerprint, fingerprint),
    ),
  });

  if (!vote) {
    return NextResponse.json({ error: 'Vote not found' }, { status: 404 });
  }

  await db.delete(songVoteTable).where(eq(songVoteTable.id, vote.id));

  await db
    .update(songSuggestionTable)
    .set({
      voteCount: sql`GREATEST(${songSuggestionTable.voteCount} - 1, 0)`,
    })
    .where(eq(songSuggestionTable.id, songId));

  const updated = await db.query.songSuggestionTable.findFirst({
    where: eq(songSuggestionTable.id, songId),
    columns: { voteCount: true },
  });

  return NextResponse.json({
    message: 'Vote removed',
    vote_count: updated?.voteCount ?? 0,
  });
}
