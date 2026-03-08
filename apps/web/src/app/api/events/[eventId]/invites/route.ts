import { randomBytes } from 'node:crypto';

import { createInviteSchema } from '@saas/validators';
import { and, desc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { InviteEmail } from '@/emails/InviteEmail';
import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { sendEmail } from '@/libs/resend';
import { eventRoleTable, eventTable, inviteTable } from '@/models/Schema';
import { isEventPaid } from '@/utils/eventAccess';

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
  try {
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
  } catch (error) {
    console.error('[GET /api/events/[eventId]/invites]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
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

    const event = await db.query.eventTable.findFirst({
      where: eq(eventTable.id, eventId),
      columns: { paymentStatus: true },
    });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const teamRoles = ['co_host', 'coordinator', 'dj', 'vendor'] as const;
    if (
      !isEventPaid(event)
      && teamRoles.includes(parsed.data.role as (typeof teamRoles)[number])
    ) {
      return NextResponse.json(
        {
          error: 'Unlock this event to add team roles (co-host, DJ, vendor)',
          code: 'UPGRADE_REQUIRED',
        },
        { status: 403 },
      );
    }

    const data = parsed.data;
    const code = randomBytes(12).toString('base64url');
    const baseUrl
      = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';

    const [invite] = await db
      .insert(inviteTable)
      .values({
        eventId,
        code,
        role: data.role,
        maxUses: data.max_uses ?? null,
        expiresAt: data.expires_at ? new Date(data.expires_at) : null,
        createdBy: session.user.id,
      })
      .returning();

    if (!invite) {
      return NextResponse.json(
        { error: 'Failed to create invite' },
        { status: 500 },
      );
    }

    if (data.email) {
      const event = await db.query.eventTable.findFirst({
        where: eq(eventTable.id, eventId),
        columns: { title: true, eventDate: true },
      });

      if (event) {
        const appUrl
          = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
        const inviteUrl = `${appUrl}/invite/${code}`;
        const eventDate = event.eventDate
          ? event.eventDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })
          : undefined;

        void sendEmail({
          to: data.email,
          subject: `You're invited to ${event.title}!`,
          react: InviteEmail({
            eventTitle: event.title,
            hostName: session.user.name ?? 'the host',
            role: data.role,
            inviteUrl,
            eventDate,
            message: data.message,
          }),
        });
      }
    }

    const url = `${baseUrl}/invite/${code}`;
    return NextResponse.json(
      { invite, url },
      { status: 201 },
    );
  } catch (error) {
    console.error('[POST /api/events/[eventId]/invites]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
