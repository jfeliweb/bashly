import { updateSongStatusSchema } from '@saas/validators';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { SongApprovedEmail } from '@/emails/SongApprovedEmail';
import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { sendEmail } from '@/libs/resend';
import {
  eventRoleTable,
  eventTable,
  rsvpTable,
  songSuggestionTable,
} from '@/models/Schema';

type RouteParams = { params: Promise<{ eventId: string; songId: string }> };

async function isOwnerOrCoHost(eventId: string, userId: string): Promise<boolean> {
  const row = await db.query.eventRoleTable.findFirst({
    where: and(
      eq(eventRoleTable.eventId, eventId),
      eq(eventRoleTable.userId, userId),
    ),
    columns: { role: true },
  });
  return row?.role === 'owner' || row?.role === 'co_host';
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId, songId } = await params;
  const isAuthorized = await isOwnerOrCoHost(eventId, session.user.id);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSongStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error },
      { status: 400 },
    );
  }

  const existingSong = await db.query.songSuggestionTable.findFirst({
    where: and(
      eq(songSuggestionTable.id, songId),
      eq(songSuggestionTable.eventId, eventId),
    ),
  });

  if (!existingSong) {
    return NextResponse.json({ error: 'Song not found' }, { status: 404 });
  }

  const [updated] = await db
    .update(songSuggestionTable)
    .set({
      ...(parsed.data.status && { status: parsed.data.status }),
      ...(parsed.data.sort_order !== undefined && { sortOrder: parsed.data.sort_order }),
    })
    .where(
      and(
        eq(songSuggestionTable.id, songId),
        eq(songSuggestionTable.eventId, eventId),
      ),
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  // Send approval notification email (fire-and-forget)
  if (
    parsed.data.status === 'approved'
    && existingSong.status !== 'approved'
    && existingSong.guestName
  ) {
    const rsvp = existingSong.rsvpId
      ? await db.query.rsvpTable.findFirst({
        where: eq(rsvpTable.id, existingSong.rsvpId),
        columns: { email: true },
      })
      : null;

    if (rsvp?.email) {
      const event = await db.query.eventTable.findFirst({
        where: eq(eventTable.id, eventId),
        columns: { title: true, slug: true },
      });

      if (event) {
        const eventPageUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/e/${event.slug}`;

        void sendEmail({
          to: rsvp.email,
          subject: `Your song request for ${event.title} was approved! 🎵`,
          react: SongApprovedEmail({
            guestName: existingSong.guestName,
            trackTitle: updated.trackTitle,
            artistName: updated.artistName,
            albumArtUrl: updated.albumArtUrl ?? undefined,
            eventTitle: event.title,
            eventPageUrl,
            guestMessage: updated.guestMessage ?? undefined,
          }),
        });
      }
    }
  }

  return NextResponse.json({ song: updated });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId, songId } = await params;
  const isAuthorized = await isOwnerOrCoHost(eventId, session.user.id);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await db
    .delete(songSuggestionTable)
    .where(
      and(
        eq(songSuggestionTable.id, songId),
        eq(songSuggestionTable.eventId, eventId),
      ),
    );

  return new NextResponse(null, { status: 204 });
}
