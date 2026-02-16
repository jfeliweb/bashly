import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventRoleTable, eventTable, inviteTable } from '@/models/Schema';

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

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code } = await params;

  const invite = await db.query.inviteTable.findFirst({
    where: eq(inviteTable.code, code),
    columns: { id: true, eventId: true, role: true, expiresAt: true, useCount: true, maxUses: true },
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

  await db
    .update(inviteTable)
    .set({ useCount: invite.useCount + 1 })
    .where(eq(inviteTable.id, invite.id));

  const existingRole = await db.query.eventRoleTable.findFirst({
    where: and(
      eq(eventRoleTable.eventId, invite.eventId),
      eq(eventRoleTable.userId, session.user.id),
    ),
  });

  if (!existingRole) {
    await db.insert(eventRoleTable).values({
      eventId: invite.eventId,
      userId: session.user.id,
      role: invite.role,
    });
  }

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.id, invite.eventId),
    columns: { slug: true },
  });

  if (!event) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const hostRoles = ['owner', 'co_host', 'coordinator', 'dj', 'vendor'];
  const isHost = hostRoles.includes(invite.role);
  const redirectPath = isHost
    ? `/dashboard/events/${invite.eventId}`
    : `/e/${event.slug}`;

  return NextResponse.json({ redirect: redirectPath });
}
