import { eq, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import {
  eventTable,
  promoCodeRedemptionTable,
  promoCodeTable,
} from '@/models/Schema';

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
    const checkoutSession = event.data.object as Stripe.Checkout.Session;

    if (checkoutSession.mode === 'payment' && checkoutSession.metadata?.eventId) {
      const paymentStatus = checkoutSession.payment_status as string;
      const isSuccessful = paymentStatus === 'paid'
        || paymentStatus === 'no_payment_required'
        || paymentStatus === 'no_payment_needed';
      if (!isSuccessful) {
        return NextResponse.json({ received: true });
      }

      const eventId = checkoutSession.metadata.eventId;
      const userId = checkoutSession.metadata.userId;
      const promoCodeId = checkoutSession.metadata.promoCodeId;
      const paymentIntentId = typeof checkoutSession.payment_intent === 'string'
        ? checkoutSession.payment_intent
        : checkoutSession.payment_intent?.id ?? null;

      if (!eventId || !userId) {
        return NextResponse.json({ received: true });
      }

      await db.transaction(async (tx) => {
        await tx
          .update(eventTable)
          .set({
            paymentStatus: 'paid',
            stripePaymentIntentId: paymentIntentId ?? undefined,
          })
          .where(eq(eventTable.id, eventId));

        if (promoCodeId) {
          const insertedRedemption = await tx
            .insert(promoCodeRedemptionTable)
            .values({
              promoCodeId,
              userId,
              eventId,
              stripeSessionId: checkoutSession.id,
            })
            .onConflictDoNothing({
              target: [
                promoCodeRedemptionTable.userId,
                promoCodeRedemptionTable.eventId,
              ],
            })
            .returning({ id: promoCodeRedemptionTable.id });

          if (insertedRedemption.length > 0) {
            await tx
              .update(promoCodeTable)
              .set({ redemptionCount: sql`${promoCodeTable.redemptionCount} + 1` })
              .where(eq(promoCodeTable.id, promoCodeId));
          }
        }
      });
    }

    // Subscription handling can be added here for backwards compatibility
    // when subscription billing is re-enabled.
  }

  return NextResponse.json({ received: true });
}
