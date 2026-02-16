import { scheduleItemSchema } from '@saas/validators';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventRoleTable, scheduleItemTable } from '@/models/Schema';

type RouteParams = { params: Promise<{ eventId: string; itemId: string }> };

async function getRole(eventId: string, userId: string): Promise<'owner' | 'co_host' | null> {
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

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const { eventId, itemId } = await params;
  const role = await getRole(eventId, userId);
  if (role !== 'owner' && role !== 'co_host') {
    return NextResponse.json(
      { error: 'Forbidden', code: 'INSUFFICIENT_ROLE' },
      { status: 403 },
    );
  }

  const body = await req.json();
  const parsed = scheduleItemSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const [updated] = await db
    .update(scheduleItemTable)
    .set({
      ...(data.start_time !== undefined && { startTime: data.start_time }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.note !== undefined && { note: data.note }),
      ...(data.sort_order !== undefined && { sortOrder: data.sort_order }),
    })
    .where(
      and(
        eq(scheduleItemTable.id, itemId),
        eq(scheduleItemTable.eventId, eventId),
      ),
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const { eventId, itemId } = await params;
  const role = await getRole(eventId, userId);
  if (role !== 'owner' && role !== 'co_host') {
    return NextResponse.json(
      { error: 'Forbidden', code: 'INSUFFICIENT_ROLE' },
      { status: 403 },
    );
  }

  const [deleted] = await db
    .delete(scheduleItemTable)
    .where(
      and(
        eq(scheduleItemTable.id, itemId),
        eq(scheduleItemTable.eventId, eventId),
      ),
    )
    .returning({ id: scheduleItemTable.id });

  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
