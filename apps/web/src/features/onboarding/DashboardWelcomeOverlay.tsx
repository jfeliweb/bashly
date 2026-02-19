'use client';

import { WelcomeScreen } from '@/features/onboarding/WelcomeScreen';

type DashboardWelcomeOverlayProps = {
  show: boolean;
  userName: string;
};

export function DashboardWelcomeOverlay({ show, userName }: DashboardWelcomeOverlayProps) {
  if (!show) return null;
  return <WelcomeScreen userName={userName || 'there'} />;
}
