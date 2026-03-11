'use client';

import * as Sentry from '@sentry/nextjs';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { logError, logWarn } from '@/libs/sentryLogger';

type PromoState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'valid'; description: string }
  | { status: 'invalid'; reason: string };

type Props = {
  eventId: string;
  prefillCode?: string;
  onValidated: (code: string) => void;
  onCleared: () => void;
};

type ValidatePromoSuccess = {
  valid: true;
  promoCodeId: string;
  stripeCouponId: string;
  description: string;
};

type ValidatePromoFailure = {
  valid: false;
  reason: string;
};

type ValidatePromoError = {
  error: string;
};

type ValidatePromoResponse =
  | ValidatePromoSuccess
  | ValidatePromoFailure
  | ValidatePromoError;

function normalizeCode(code: string): string {
  return code.toUpperCase().trim();
}

export function PromoCodeInput({
  eventId,
  prefillCode,
  onValidated,
  onCleared,
}: Props) {
  const t = useTranslations('Billing');
  const [code, setCode] = useState(prefillCode ? normalizeCode(prefillCode) : '');
  const [state, setState] = useState<PromoState>({ status: 'idle' });

  const validate = useCallback(async (targetCode: string) => {
    const normalizedCode = normalizeCode(targetCode);
    if (!normalizedCode) {
      return;
    }

    setState({ status: 'loading' });

    try {
      const res = await fetch('/api/billing/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: normalizedCode, eventId }),
      });
      const data: ValidatePromoResponse = await res.json();

      if (!res.ok) {
        logWarn('billing', 'Billing: validate-promo API error', {
          eventId,
          status: res.status,
        });
        setState({ status: 'invalid', reason: t('promo_invalid_request') });
        onCleared();
        return;
      }

      if ('valid' in data && data.valid) {
        setState({ status: 'valid', description: data.description });
        onValidated(normalizedCode);
        return;
      }

      if ('valid' in data && !data.valid) {
        setState({ status: 'invalid', reason: data.reason });
        onCleared();
        return;
      }

      setState({ status: 'invalid', reason: t('promo_invalid_request') });
      onCleared();
    } catch (err) {
      Sentry.captureException(err);
      logError('billing', 'Billing: validate-promo request failed', {
        eventId,
        error: err instanceof Error ? err.message : 'Unknown',
      });
      setState({ status: 'invalid', reason: t('promo_invalid_request') });
      onCleared();
    }
  }, [eventId, onCleared, onValidated, t]);

  function clear() {
    setCode('');
    setState({ status: 'idle' });
    onCleared();
  }

  useEffect(() => {
    if (!prefillCode) {
      return;
    }
    void validate(prefillCode);
  }, [prefillCode, validate]);

  return (
    <div className="space-y-2">
      <details>
        <summary className="cursor-pointer select-none list-none font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-[rgb(48_153_0)] dark:text-[rgb(116_255_51)]">
          {t('promo_have_code')}
        </summary>

        <div className="mt-3 flex gap-2">
          <Input
            type="text"
            value={code}
            onChange={e => setCode(normalizeCode(e.target.value))}
            placeholder={t('promo_placeholder')}
            aria-label={t('promo_aria_label')}
            className="font-mono uppercase"
            disabled={state.status === 'loading' || state.status === 'valid'}
          />
          {state.status === 'valid'
            ? (
                <Button
                  variant="outline"
                  onClick={clear}
                  aria-label={t('promo_remove_aria_label')}
                >
                  {t('promo_remove')}
                </Button>
              )
            : (
                <Button
                  onClick={() => {
                    void validate(code);
                  }}
                  disabled={state.status === 'loading' || !code.trim()}
                >
                  {state.status === 'loading'
                    ? t('promo_checking')
                    : t('promo_apply')}
                </Button>
              )}
        </div>

        {state.status === 'valid' && (
          <p
            role="status"
            aria-live="polite"
            className="mt-2 text-sm font-medium text-[rgb(48_153_0)] dark:text-[rgb(116_255_51)]"
          >
            {t('promo_success_prefix')}
            {' '}
            {state.description}
          </p>
        )}
        {state.status === 'invalid' && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {state.reason}
          </p>
        )}
      </details>
    </div>
  );
}
