import { scheduleItemSchema } from '@saas/validators';
import { and, asc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventRoleTable, scheduleItemTable } from '@/models/Schema';

type RouteParams = { params: Promise<{ eventId: string }> };

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

export async function GET(
  _req: NextRequest,
  { params }: RouteParams,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId } = await params;
  const canView = await isOwnerOrCoHost(eventId, session.user.id);
  if (!canView) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const items = await db.query.scheduleItemTable.findMany({
    where: eq(scheduleItemTable.eventId, eventId),
    orderBy: [asc(scheduleItemTable.sortOrder)],
  });

  return NextResponse.json({ items });
}

export async function POST(
  req: NextRequest,
  { params }: RouteParams,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId } = await params;
  const canManage = await isOwnerOrCoHost(eventId, session.user.id);
  if (!canManage) {
    return NextResponse.json(
      { error: 'Forbidden', code: 'INSUFFICIENT_ROLE' },
      { status: 403 },
    );
  }

  const body = await req.json();
  const parsed = scheduleItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  const [item] = await db
    .insert(scheduleItemTable)
    .values({
      eventId,
      startTime: parsed.data.start_time,
      title: parsed.data.title,
      note: parsed.data.note,
      sortOrder: parsed.data.sort_order,
    })
    .returning();

  if (!item) {
    return NextResponse.json(
      { error: 'Failed to create schedule item' },
      { status: 500 },
    );
  }

  return NextResponse.json({ item }, { status: 201 });
}
