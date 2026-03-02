import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { eventTable } from '@/models/Schema';

export async function POST(req: NextRequest) {
  if (!Env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(Env.STRIPE_SECRET_KEY ?? '');
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // One-time payment: update event payment status
    if (session.mode === 'payment' && session.metadata?.eventId) {
      const eventId = session.metadata.eventId as string;
      const paymentIntent = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

      await db
        .update(eventTable)
        .set({
          paymentStatus: 'paid',
          stripePaymentIntentId: paymentIntent ?? undefined,
        })
        .where(eq(eventTable.id, eventId));
    }

    // Subscription handling can be added here for backwards compatibility
    // when subscription billing is re-enabled.
  }

  return NextResponse.json({ received: true });
}
