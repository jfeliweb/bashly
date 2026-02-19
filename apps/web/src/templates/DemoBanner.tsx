import Link from 'next/link';

import { StickyBanner } from '@/features/landing/StickyBanner';

export const DemoBanner = () => (
  <StickyBanner>
    Live Demo —
    {' '}
    <Link href="/sign-up">Explore the Dashboard</Link>
  </StickyBanner>
);
