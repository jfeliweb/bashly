import { registryLinkSchema } from '@saas/validators';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventRoleTable, registryLinkTable } from '@/models/Schema';

type RouteParams = { params: Promise<{ eventId: string; linkId: string }> };

async function hasWriteRole(eventId: string, userId: string): Promise<boolean> {
  const row = await db.query.eventRoleTable.findFirst({
    where: and(
      eq(eventRoleTable.eventId, eventId),
      eq(eventRoleTable.userId, userId),
    ),
    columns: { role: true },
  });
  if (!row) {
    return false;
  }
  return row.role === 'owner' || row.role === 'co_host';
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId, linkId } = await params;
  const allowed = await hasWriteRole(eventId, session.user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Forbidden', code: 'INSUFFICIENT_ROLE' },
      { status: 403 },
    );
  }

  const body = await req.json();
  const parsed = registryLinkSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const updates: Record<string, unknown> = {};

  if (data.display_name !== undefined) {
    updates.displayName = data.display_name;
  }
  if (data.url !== undefined) {
    updates.url = data.url;
    updates.domain = new URL(data.url).hostname.replace(/^www\./, '');
  }
  if (data.sort_order !== undefined) {
    updates.sortOrder = data.sort_order;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const [updated] = await db
    .update(registryLinkTable)
    .set(updates)
    .where(
      and(
        eq(registryLinkTable.id, linkId),
        eq(registryLinkTable.eventId, eventId),
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

  const { eventId, linkId } = await params;
  const allowed = await hasWriteRole(eventId, session.user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Forbidden', code: 'INSUFFICIENT_ROLE' },
      { status: 403 },
    );
  }

  await db
    .delete(registryLinkTable)
    .where(
      and(
        eq(registryLinkTable.id, linkId),
        eq(registryLinkTable.eventId, eventId),
      ),
    );

  return new NextResponse(null, { status: 204 });
}
