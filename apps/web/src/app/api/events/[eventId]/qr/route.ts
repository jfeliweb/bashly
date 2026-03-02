import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { eventRoleTable, eventTable } from '@/models/Schema';
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

export async function GET(req: NextRequest, { params }: RouteParams) {
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

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.id, eventId),
    columns: { slug: true, paymentStatus: true },
  });

  if (!event) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!isEventPaid(event)) {
    return NextResponse.json(
      {
        error: 'Unlock this event to download QR codes',
        code: 'UPGRADE_REQUIRED',
      },
      { status: 403 },
    );
  }

  const baseUrl
    = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
  const guestUrl = `${baseUrl}/e/${event.slug}`;

  const format = req.nextUrl.searchParams.get('format') ?? 'png';
  const isSvg = format === 'svg';

  if (isSvg) {
    const svg = await QRCode.toString(guestUrl, { type: 'svg', width: 400 });
    return new NextResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  }

  const buffer = await QRCode.toBuffer(guestUrl, { width: 400 });
  return new NextResponse(new Uint8Array(buffer), {
    headers: { 'Content-Type': 'image/png' },
  });
}
