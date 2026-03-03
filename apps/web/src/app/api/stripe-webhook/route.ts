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
  } catch (err) {
    console.error('[stripe] Signature verification failed', err);
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

        const paymentIntentId =
          typeof session.payment_intent === 'string'
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
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('[stripe] payment_intent.payment_failed', {
          paymentIntentId: paymentIntent.id,
          eventId: paymentIntent.metadata?.eventId ?? 'no eventId in metadata',
          failureCode: paymentIntent.last_payment_error?.code ?? 'unknown',
          failureMessage:
            paymentIntent.last_payment_error?.message ?? 'Unknown error',
        });
        break;
      }

      case 'coupon.created': {
        const coupon = event.data.object as Stripe.Coupon;
        console.log('[stripe] coupon.created', {
          couponId: coupon.id,
          name: coupon.name,
          percentOff: coupon.percent_off,
          amountOff: coupon.amount_off,
          duration: coupon.duration,
          maxRedemptions: coupon.max_redemptions,
        });
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

        console.log(
          '[stripe] coupon.deleted - deactivated linked promo codes for coupon',
          coupon.id,
        );
        break;
      }

      case 'promotion_code.created': {
        const promoCode = event.data.object as Stripe.PromotionCode;
        const couponRef = promoCode.coupon;
        const stripeCouponId =
          typeof couponRef === 'string' ? couponRef : couponRef.id;
        const couponName = typeof couponRef === 'string' ? null : couponRef.name;

        await db
          .insert(promoCodeTable)
          .values({
            code: promoCode.code.toUpperCase(),
            stripeCouponId,
            stripePromotionCodeId: promoCode.id,
            description: couponName ?? null,
            upgradeScope: 'event',
            maxRedemptions: promoCode.max_redemptions ?? null,
            expiresAt: promoCode.expires_at
              ? new Date(promoCode.expires_at * 1000)
              : null,
            active: promoCode.active,
          })
          .onConflictDoNothing();

        console.log(
          '[stripe] promotion_code.created - synced to DB:',
          promoCode.code.toUpperCase(),
        );
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

        console.log(
          '[stripe] promotion_code.updated',
          promoCode.code,
          '-> active:',
          promoCode.active,
        );
        break;
      }

      case 'customer.discount.created': {
        const discount = event.data.object as Stripe.Discount;
        console.log('[stripe] customer.discount.created', {
          customerId: discount.customer,
          couponId: discount.coupon.id,
          promotionCodeId: discount.promotion_code ?? null,
        });
        break;
      }

      case 'customer.discount.updated': {
        const discount = event.data.object as Stripe.Discount;
        console.log('[stripe] customer.discount.updated', {
          customerId: discount.customer,
          couponId: discount.coupon.id,
        });
        break;
      }

      case 'customer.discount.deleted': {
        const discount = event.data.object as Stripe.Discount;
        console.log('[stripe] customer.discount.deleted', {
          customerId: discount.customer,
          couponId: discount.coupon.id,
        });
        break;
      }

      default:
        console.log('[stripe] Unhandled event type:', event.type);
    }
  } catch (err) {
    console.error('[stripe] Handler error for event', event.type, err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
