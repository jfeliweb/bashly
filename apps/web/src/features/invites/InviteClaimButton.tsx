'use client';

import * as Sentry from '@sentry/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { logError, logWarn } from '@/libs/sentryLogger';

type Props = { code: string };

export function InviteClaimButton({ code }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/invites/${code}/claim`, { method: 'POST' });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        const msg = data.error ?? 'Failed to claim invite. Please try again.';
        logWarn('invites', 'Invites: claim failed', {
          code: `${code.slice(0, 4)}***`,
          status: res.status,
          error: msg,
        });
        setError(msg);
        return;
      }

      const data = (await res.json()) as { redirect: string };
      router.push(data.redirect);
    } catch (err) {
      Sentry.captureException(err);
      logError('invites', 'Invites: claim request failed', {
        code: `${code.slice(0, 4)}***`,
        error: err instanceof Error ? err.message : 'Unknown',
      });
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClaim}
        disabled={loading}
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-[100px] bg-[rgb(81,255,0)] px-6 font-bold text-[rgb(9,21,27)] hover:bg-[rgb(65,204,0)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)] disabled:cursor-not-allowed disabled:opacity-50"
        aria-busy={loading}
      >
        {loading ? 'Accepting…' : 'Accept Invitation'}
      </button>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
