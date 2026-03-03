import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { validatePromoSchema } from '@/libs/validators/promo';
import {
  eventRoleTable,
  eventTable,
  promoCodeRedemptionTable,
  promoCodeTable,
} from '@/models/Schema';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = validatePromoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { code, eventId } = parsed.data;

  const role = await db.query.eventRoleTable.findFirst({
    where: and(
      eq(eventRoleTable.eventId, eventId),
      eq(eventRoleTable.userId, session.user.id),
    ),
    columns: { role: true },
  });

  if (role?.role !== 'owner') {
    return NextResponse.json(
      { error: 'Only the event owner can validate promo codes' },
      { status: 403 },
    );
  }

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.id, eventId),
    columns: { id: true, paymentStatus: true },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (event.paymentStatus === 'paid') {
    return NextResponse.json({
      valid: false,
      reason: 'This event is already unlocked',
    });
  }

  const promo = await db.query.promoCodeTable.findFirst({
    where: eq(promoCodeTable.code, code),
  });

  if (!promo || !promo.active) {
    return NextResponse.json({
      valid: false,
      reason: 'Code not found or inactive',
    });
  }

  if (promo.upgradeScope !== 'event') {
    return NextResponse.json({
      valid: false,
      reason: 'Code scope is not supported',
    });
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, reason: 'Code has expired' });
  }

  if (
    promo.maxRedemptions !== null
    && promo.redemptionCount >= promo.maxRedemptions
  ) {
    return NextResponse.json({
      valid: false,
      reason: 'Code has reached its redemption limit',
    });
  }

  const alreadyRedeemed = await db.query.promoCodeRedemptionTable.findFirst({
    where: and(
      eq(promoCodeRedemptionTable.userId, session.user.id),
      eq(promoCodeRedemptionTable.eventId, eventId),
    ),
  });

  if (alreadyRedeemed) {
    return NextResponse.json({
      valid: false,
      reason: 'You have already used a promo code for this event',
    });
  }

  return NextResponse.json({
    valid: true,
    promoCodeId: promo.id,
    stripeCouponId: promo.stripeCouponId,
    description: promo.description ?? 'Promo code applied!',
  });
}
