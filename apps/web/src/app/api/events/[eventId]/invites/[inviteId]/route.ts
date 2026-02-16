import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventRoleTable, inviteTable } from '@/models/Schema';

type RouteParams = { params: Promise<{ eventId: string; inviteId: string }> };

async function getRole(
  eventId: string,
  userId: string,
): Promise<'owner' | 'co_host' | null> {
  const row = await db.query.eventRoleTable.findFirst({
    where: and(
      eq(eventRoleTable.eventId, eventId),
      eq(eventRoleTable.userId, userId),
    ),
    columns: { role: true },
  });
  if (!row) {
    return null;
  }
  if (row.role === 'owner' || row.role === 'co_host') {
    return row.role;
  }
  return null;
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId, inviteId } = await params;
  const role = await getRole(eventId, session.user.id);
  if (role !== 'owner') {
    return NextResponse.json(
      { error: 'Forbidden', code: 'INSUFFICIENT_ROLE' },
      { status: 403 },
    );
  }

  await db
    .delete(inviteTable)
    .where(
      and(
        eq(inviteTable.id, inviteId),
        eq(inviteTable.eventId, eventId),
      ),
    );

  return new NextResponse(null, { status: 204 });
}
