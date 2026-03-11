import { and, eq, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import {
  eventRoleTable,
  eventTable,
  promoCodeRedemptionTable,
  promoCodeTable,
} from '@/models/Schema';
import { PLAN_ID, PlanConfig } from '@/utils/AppConfig';

const CELEBRATION_PRICE_CENTS = (PlanConfig[PLAN_ID.CELEBRATION].price ?? 29) * 100;

const createCheckoutSchema = z.object({
  eventId: z.string().uuid(),
  promoCode: z
    .string()
    .min(1)
    .max(64)
    .transform(value => value.toUpperCase().trim())
    .optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { eventId, promoCode } = parsed.data;

  // Verify user is event owner
  const role = await db.query.eventRoleTable.findFirst({
    where: and(
      eq(eventRoleTable.eventId, eventId),
      eq(eventRoleTable.userId, session.user.id),
    ),
    columns: { role: true },
  });

  if (role?.role !== 'owner') {
    return NextResponse.json(
      { error: 'Only the event owner can unlock this event' },
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
    return NextResponse.json(
      { error: 'This event is already unlocked' },
      { status: 400 },
    );
  }

  const plan = PlanConfig[PLAN_ID.CELEBRATION];
  const priceId
    = Env.BILLING_PLAN_ENV === 'prod' || Env.NODE_ENV === 'production'
      ? plan.prodPriceId
      : plan.devPriceId;

  if (!priceId || !Env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 },
    );
  }

  const stripe = new Stripe(Env.STRIPE_SECRET_KEY);

  const baseUrl = (Env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const reqHeaders = await headers();
  const locale = reqHeaders.get('x-next-intl-locale') ?? 'en';

  let stripeCouponId: string | undefined;
  let promoCodeId: string | undefined;

  if (promoCode) {
    const promo = await db.query.promoCodeTable.findFirst({
      where: eq(promoCodeTable.code, promoCode),
    });

    const isValid = Boolean(
      promo
      && promo.active
      && promo.upgradeScope === 'event'
      && (!promo.expiresAt || promo.expiresAt > new Date())
      && (promo.maxRedemptions === null || promo.redemptionCount < promo.maxRedemptions),
    );

    if (!isValid || !promo) {
      return NextResponse.json(
        { error: 'Promo code is no longer valid' },
        { status: 400 },
      );
    }

    const alreadyRedeemed = await db.query.promoCodeRedemptionTable.findFirst({
      where: and(
        eq(promoCodeRedemptionTable.userId, session.user.id),
        eq(promoCodeRedemptionTable.eventId, eventId),
      ),
    });

    if (alreadyRedeemed) {
      return NextResponse.json(
        { error: 'Promo code already used for this event' },
        { status: 400 },
      );
    }

    stripeCouponId = promo.stripeCouponId;
    promoCodeId = promo.id;

    // 100% off or full amount discount: skip Stripe, unlock event directly
    const coupon = await stripe.coupons.retrieve(promo.stripeCouponId);
    const isFullDiscount = Boolean(
      (coupon.percent_off != null && coupon.percent_off >= 100)
      || (coupon.amount_off != null && coupon.amount_off >= CELEBRATION_PRICE_CENTS),
    );

    if (isFullDiscount) {
      await db
        .update(eventTable)
        .set({
          paymentStatus: 'paid',
          stripePaymentIntentId: null,
        })
        .where(eq(eventTable.id, eventId));

      await db.insert(promoCodeRedemptionTable).values({
        promoCodeId,
        userId: session.user.id,
        eventId,
        stripeSessionId: null,
      });

      await db
        .update(promoCodeTable)
        .set({ redemptionCount: sql`${promoCodeTable.redemptionCount} + 1` })
        .where(eq(promoCodeTable.id, promoCodeId));

      const successUrl = `${baseUrl}/${locale}/dashboard/billing/checkout-confirmation?eventId=${eventId}`;
      return NextResponse.json({ url: successUrl });
    }
  }

  const checkoutParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    customer_email: session.user.email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      eventId,
      userId: session.user.id,
      ...(promoCodeId ? { promoCodeId } : {}),
    },
    // success_url: `${baseUrl}/dashboard/billing/checkout-confirmation?eventId=${eventId}`,
    // cancel_url: `${baseUrl}/dashboard/events/${eventId}`,
    success_url: `${baseUrl}/${locale}/dashboard/billing/checkout-confirmation?eventId=${eventId}`,
    cancel_url: `${baseUrl}/${locale}/dashboard/events/${eventId}`,
    ...(stripeCouponId ? { discounts: [{ coupon: stripeCouponId }] } : {}),
  };

  const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);

  if (!checkoutSession.url) {
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: checkoutSession.url });
}
