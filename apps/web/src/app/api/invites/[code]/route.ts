import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { eventTable, inviteTable } from '@/models/Schema';

type RouteParams = { params: Promise<{ code: string }> };

function isExpired(invite: { expiresAt: Date | null; useCount: number; maxUses: number | null }): boolean {
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return true;
  }
  if (invite.maxUses != null && invite.useCount >= invite.maxUses) {
    return true;
  }
  return false;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { code } = await params;

  const invite = await db.query.inviteTable.findFirst({
    where: eq(inviteTable.code, code),
    columns: { eventId: true, role: true, expiresAt: true, useCount: true, maxUses: true },
  });

  if (!invite) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (isExpired(invite)) {
    return NextResponse.json(
      { error: 'Invite has expired' },
      { status: 410 },
    );
  }

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.id, invite.eventId),
    columns: { slug: true, title: true },
  });

  if (!event) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    event_id: invite.eventId,
    role: invite.role,
    event_slug: event.slug,
    event_title: event.title,
  });
}
