import { db } from '../src/libs/DB';
import { promoCodeTable } from '../src/models/Schema';

async function seedPromoCodes() {
  await db.insert(promoCodeTable).values([
    {
      code: 'SWEET16FREE',
      stripeCouponId: 'your_stripe_100pct_off_coupon_id',
      description: 'Free Celebration event upgrade - beta gift',
      upgradeScope: 'event',
      maxRedemptions: 1,
      active: true,
    },
    {
      code: 'BASHLY-LAUNCH',
      stripeCouponId: 'your_stripe_50pct_off_coupon_id',
      description: '50% off launch promo',
      upgradeScope: 'event',
      maxRedemptions: 200,
      expiresAt: new Date('2025-12-31'),
      active: true,
    },
  ]);
}

void seedPromoCodes()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
