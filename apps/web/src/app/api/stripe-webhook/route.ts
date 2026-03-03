import { and, eq, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import {
  eventTable,
  promoCodeRedemptionTable,
  promoCodeTable,
} from '@/models/Schema';

const stripe = new Stripe(Env.STRIPE_SECRET_KEY ?? '');

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
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentStatus = session.payment_status as string;
        const isSuccessful = ['paid', 'no_payment_needed'].includes(
          paymentStatus,
        );
        if (!isSuccessful) {
          break;
        }

        const { eventId, userId, promoCodeId } = session.metadata ?? {};
        if (!eventId || !userId) {
          break;
        }

        const paymentIntentId
          = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : null;

        await db.transaction(async (tx) => {
          await tx
            .update(eventTable)
            .set({ paymentStatus: 'paid', stripePaymentIntentId: paymentIntentId })
            .where(eq(eventTable.id, eventId));

          if (promoCodeId) {
            const insertedRedemptions = await tx
              .insert(promoCodeRedemptionTable)
              .values({
                promoCodeId,
                userId,
                eventId,
                stripeSessionId: session.id,
              })
              .onConflictDoNothing({
                target: [
                  promoCodeRedemptionTable.userId,
                  promoCodeRedemptionTable.eventId,
                ],
              })
              .returning({ id: promoCodeRedemptionTable.id });

            if (insertedRedemptions.length > 0) {
              await tx
                .update(promoCodeTable)
                .set({ redemptionCount: sql`${promoCodeTable.redemptionCount} + 1` })
                .where(eq(promoCodeTable.id, promoCodeId));
            }
          }
        });
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const eventId = paymentIntent.metadata?.eventId;
        if (!eventId) {
          break;
        }

        await db
          .update(eventTable)
          .set({
            paymentStatus: 'paid',
            stripePaymentIntentId: paymentIntent.id,
          })
          .where(
            and(
              eq(eventTable.id, eventId),
              eq(eventTable.paymentStatus, 'free'),
            ),
          );
        break;
      }

      case 'payment_intent.payment_failed': {
        break;
      }

      case 'coupon.created': {
        break;
      }

      case 'coupon.updated': {
        const coupon = event.data.object as Stripe.Coupon;
        if (coupon.name) {
          await db
            .update(promoCodeTable)
            .set({ description: coupon.name })
            .where(eq(promoCodeTable.stripeCouponId, coupon.id));
        }
        break;
      }

      case 'coupon.deleted': {
        const coupon = event.data.object as Stripe.Coupon;
        await db
          .update(promoCodeTable)
          .set({ active: false })
          .where(eq(promoCodeTable.stripeCouponId, coupon.id));
        break;
      }

      // REPLACE — handles both old and new Stripe API shapes
      case 'promotion_code.created': {
        const promoCode = event.data.object as Stripe.PromotionCode & {
          promotion?: { coupon: string; type: string };
        };

        // Stripe API 2026-02-25.clover moved coupon under promoCode.promotion.coupon (string ID).
        // Older API versions returned promoCode.coupon as a string or expanded Coupon object.
        // Support both shapes so this handler works regardless of API version.
        const stripeCouponId: string | null
          = typeof promoCode.promotion?.coupon === 'string'
            ? promoCode.promotion.coupon // new shape
            : typeof (promoCode as any).coupon === 'string'
              ? (promoCode as any).coupon // old shape, unexpanded
              : (promoCode as any).coupon?.id ?? null; // old shape, expanded object

        if (!stripeCouponId) {
          break;
        }

        await db
          .insert(promoCodeTable)
          .values({
            code: promoCode.code.toUpperCase(),
            stripeCouponId,
            stripePromotionCodeId: promoCode.id,
            description: null, // coupon name not available in new API shape without a separate fetch
            upgradeScope: 'event',
            maxRedemptions: promoCode.max_redemptions ?? null,
            expiresAt: promoCode.expires_at
              ? new Date(promoCode.expires_at * 1000)
              : null,
            active: promoCode.active,
          })
          .onConflictDoUpdate({
            target: promoCodeTable.code,
            set: {
              active: promoCode.active,
              expiresAt: promoCode.expires_at
                ? new Date(promoCode.expires_at * 1000)
                : null,
            },
          });
        break;
      }

      case 'promotion_code.updated': {
        const promoCode = event.data.object as Stripe.PromotionCode;
        await db
          .update(promoCodeTable)
          .set({
            active: promoCode.active,
            expiresAt: promoCode.expires_at
              ? new Date(promoCode.expires_at * 1000)
              : null,
          })
          .where(eq(promoCodeTable.stripePromotionCodeId, promoCode.id));
        break;
      }

      case 'customer.discount.created': {
        break;
      }

      case 'customer.discount.updated': {
        break;
      }

      case 'customer.discount.deleted': {
        break;
      }

      default:
    }
  } catch {
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
