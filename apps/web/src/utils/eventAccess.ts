import { PLAN_ID, PlanConfig } from '@/utils/AppConfig';

/**
 * Feature gating based on event payment status.
 * Used to conditionally unlock: Spotify export, song request limits > 50,
 * guest limits > 50, registry links > 1, QR code download, team role invites.
 */
export function isEventPaid(event: { paymentStatus: string }): boolean {
  return event.paymentStatus === 'paid';
}

export function getPlanLimitsForEvent(event: { paymentStatus: string }) {
  return isEventPaid(event)
    ? PlanConfig[PLAN_ID.CELEBRATION].features
    : PlanConfig[PLAN_ID.FREE].features;
}
