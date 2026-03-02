import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { auth } from '@/libs/auth';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { eventRoleTable, eventTable } from '@/models/Schema';
import { PLAN_ID, PlanConfig } from '@/utils/AppConfig';

const createCheckoutSchema = { eventId: (v: unknown) => typeof v === 'string' && v.length > 0 };

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { eventId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const rawEventId = body.eventId;
  if (!createCheckoutSchema.eventId(rawEventId)) {
    return NextResponse.json(
      { error: 'eventId is required' },
      { status: 400 },
    );
  }
  const eventId = rawEventId as string;

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

  const baseUrl = Env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const checkoutParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    customer_email: session.user.email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      eventId,
      userId: session.user.id,
    },
    success_url: `${baseUrl}/en/dashboard/billing/checkout-confirmation?eventId=${eventId}`,
    cancel_url: `${baseUrl}/en/dashboard/events/${eventId}`,
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
