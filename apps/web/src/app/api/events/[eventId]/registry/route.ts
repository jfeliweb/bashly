import { registryLinkSchema } from '@saas/validators';
import { and, asc, count, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventRoleTable, registryLinkTable } from '@/models/Schema';

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

  const links = await db
    .select()
    .from(registryLinkTable)
    .where(eq(registryLinkTable.eventId, eventId))
    .orderBy(asc(registryLinkTable.sortOrder));

  return NextResponse.json(links);
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
  const parsed = registryLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  const [existing] = await db
    .select({ value: count() })
    .from(registryLinkTable)
    .where(eq(registryLinkTable.eventId, eventId));

  if ((existing?.value ?? 0) >= 10) {
    return NextResponse.json(
      { error: 'Maximum 10 registry links per event' },
      { status: 422 },
    );
  }

  const domain = new URL(parsed.data.url).hostname.replace(/^www\./, '');

  const [link] = await db
    .insert(registryLinkTable)
    .values({
      eventId,
      displayName: parsed.data.display_name,
      url: parsed.data.url,
      domain,
      sortOrder: parsed.data.sort_order,
    })
    .returning();

  return NextResponse.json(link, { status: 201 });
}
