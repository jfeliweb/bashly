import { randomBytes } from 'node:crypto';

import { createInviteSchema } from '@saas/validators';
import { and, desc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventRoleTable, inviteTable } from '@/models/Schema';

type RouteParams = { params: Promise<{ eventId: string }> };

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

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId } = await params;
  const role = await getRole(eventId, session.user.id);
  if (role !== 'owner' && role !== 'co_host') {
    return NextResponse.json(
      { error: 'Forbidden', code: 'INSUFFICIENT_ROLE' },
      { status: 403 },
    );
  }

  const invites = await db.query.inviteTable.findMany({
    where: eq(inviteTable.eventId, eventId),
    orderBy: [desc(inviteTable.createdAt)],
  });

  return NextResponse.json(invites);
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId } = await params;
  const role = await getRole(eventId, session.user.id);
  if (role !== 'owner' && role !== 'co_host') {
    return NextResponse.json(
      { error: 'Forbidden', code: 'INSUFFICIENT_ROLE' },
      { status: 403 },
    );
  }

  const body = await req.json();
  const parsed = createInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  const code = randomBytes(12).toString('base64url');
  const baseUrl
    = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
  const [invite] = await db
    .insert(inviteTable)
    .values({
      eventId,
      code,
      role: parsed.data.role,
      maxUses: parsed.data.max_uses ?? null,
      expiresAt: parsed.data.expires_at ?? null,
      createdBy: session.user.id,
    })
    .returning();

  if (!invite) {
    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 },
    );
  }

  const url = `${baseUrl}/invite/${code}`;
  return NextResponse.json(
    { invite, url },
    { status: 201 },
  );
}
