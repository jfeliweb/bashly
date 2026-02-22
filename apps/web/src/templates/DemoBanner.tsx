import Link from 'next/link';

import { StickyBanner } from '@/features/landing/StickyBanner';

export const DemoBanner = () => (
  <StickyBanner>
    You're invited —
    {' '}
    <Link href="/sign-up">Join the Beta and plan your next party</Link>
  </StickyBanner>
);
