'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type RsvpInput, rsvpSchema } from '@saas/validators';
import FocusTrap from 'focus-trap-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { cn } from '@/utils/Helpers';

type RsvpModalProps = {
  eventSlug: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
};

type RsvpStatus = 'attending' | 'maybe' | 'declined';

function generateFingerprint(): string {
  return btoa(
    [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
    ].join('|'),
  ).slice(0, 32);
}

export function RsvpModal({
  eventSlug,
  eventTitle,
  isOpen,
  onClose,
}: RsvpModalProps) {
  const t = useTranslations('RsvpModal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RsvpInput>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      plus_ones: 0,
      dietary_restrictions: '',
      status: 'attending',
      fingerprint: '',
    },
  });

  const selectedStatus = watch('status');

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
      reset();
    }
  }, [isOpen, reset]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleStatusSelect = useCallback(
    (status: RsvpStatus) => {
      setValue('status', status);
    },
    [setValue],
  );

  const onSubmit = useCallback(
    async (formData: RsvpInput) => {
      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        const fingerprint = generateFingerprint();

        const res = await fetch(`/api/rsvp/${eventSlug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            fingerprint,
          }),
        });

        if (!res.ok) {
          const errorBody = await res.json().catch(() => null) as { error?: string } | null;
          setErrorMessage(
            errorBody?.error ?? t('submit_error'),
          );
          return;
        }

        setIsSuccess(true);
      } catch {
        setErrorMessage(t('submit_error'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [eventSlug, t],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <FocusTrap active={isOpen}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={handleOverlayClick}
        role="presentation"
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rsvp-modal-title"
          className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          style={{
            backgroundColor: 'var(--theme-surface, #ffffff)',
            color: 'var(--theme-text, #09151b)',
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'absolute right-3 top-3 flex min-h-[44px] min-w-[44px] items-center justify-center',
              'rounded-full text-lg outline-none transition-colors',
              'hover:bg-black/5',
              'focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]',
            )}
            aria-label={t('close_aria')}
          >
            ✕
          </button>

          {isSuccess
            ? (
          /* ─── Success state ─── */
                <div className="flex flex-col items-center py-8 text-center">
                  <span className="mb-4 text-6xl" role="img" aria-label="celebration">
                    🎉
                  </span>
                  <h2
                    className="mb-2 font-bricolage text-2xl font-extrabold"
                    style={{ color: 'var(--theme-text, #09151b)' }}
                  >
                    {t('success_heading')}
                  </h2>
                  <p
                    className="mb-6 font-nunito text-sm"
                    style={{ color: 'var(--theme-text-muted, #6b7280)' }}
                  >
                    {t('success_subtext')}
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className={cn(
                      'min-h-[44px] w-full rounded-[100px] px-6 font-nunito text-base font-bold text-white',
                      'outline-none transition-opacity hover:opacity-95',
                      'focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary-dark)]',
                    )}
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  >
                    {t('dismiss')}
                  </button>
                </div>
              )
            : (
          /* ─── Form state ─── */
                <>
                  <h2
                    id="rsvp-modal-title"
                    className="mb-5 pr-8 font-bricolage text-xl font-extrabold"
                    style={{ color: 'var(--theme-text, #09151b)' }}
                  >
                    {t('heading', { title: eventTitle })}
                  </h2>

                  {/* Status selector — 3 pill buttons */}
                  <fieldset className="mb-5">
                    <legend className="mb-2 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--theme-primary)' }}>
                      {t('status_label')}
                    </legend>
                    <div className="flex gap-2">
                      <StatusPill
                        label={t('status_attending')}
                        value="attending"
                        selected={selectedStatus === 'attending'}
                        onSelect={handleStatusSelect}
                        variant="green"
                      />
                      <StatusPill
                        label={t('status_maybe')}
                        value="maybe"
                        selected={selectedStatus === 'maybe'}
                        onSelect={handleStatusSelect}
                        variant="yellow"
                      />
                      <StatusPill
                        label={t('status_declined')}
                        value="declined"
                        selected={selectedStatus === 'declined'}
                        onSelect={handleStatusSelect}
                        variant="neutral"
                      />
                    </div>
                  </fieldset>

                  {/* Form */}
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="rsvp-name"
                        className="mb-1 block font-nunito text-sm font-semibold"
                        style={{ color: 'var(--theme-text, #09151b)' }}
                      >
                        {t('name_label')}
                        {' '}
                        <span aria-hidden="true" className="text-red-500">*</span>
                      </label>
                      <input
                        id="rsvp-name"
                        type="text"
                        autoComplete="name"
                        {...register('name')}
                        className={cn(
                          'w-full rounded-xl border px-4 py-3 font-nunito text-sm outline-none transition-colors',
                          'focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]',
                          errors.name ? 'border-red-400' : 'border-[var(--theme-border,#e2e8f0)]',
                        )}
                        style={{
                          backgroundColor: 'var(--theme-surface, #ffffff)',
                          color: 'var(--theme-text, #09151b)',
                        }}
                        aria-invalid={errors.name ? 'true' : undefined}
                        aria-describedby={errors.name ? 'rsvp-name-error' : undefined}
                      />
                      {errors.name && (
                        <p id="rsvp-name-error" className="mt-1 font-nunito text-xs text-red-500" role="alert">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="rsvp-email"
                        className="mb-1 block font-nunito text-sm font-semibold"
                        style={{ color: 'var(--theme-text, #09151b)' }}
                      >
                        {t('email_label')}
                      </label>
                      <input
                        id="rsvp-email"
                        type="email"
                        autoComplete="email"
                        {...register('email')}
                        className={cn(
                          'w-full rounded-xl border px-4 py-3 font-nunito text-sm outline-none transition-colors',
                          'focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]',
                          errors.email ? 'border-red-400' : 'border-[var(--theme-border,#e2e8f0)]',
                        )}
                        style={{
                          backgroundColor: 'var(--theme-surface, #ffffff)',
                          color: 'var(--theme-text, #09151b)',
                        }}
                        aria-invalid={errors.email ? 'true' : undefined}
                        aria-describedby="rsvp-email-help"
                      />
                      <p id="rsvp-email-help" className="mt-1 font-nunito text-xs" style={{ color: 'var(--theme-text-muted, #6b7280)' }}>
                        {t('email_help')}
                      </p>
                      {errors.email && (
                        <p className="mt-1 font-nunito text-xs text-red-500" role="alert">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="rsvp-phone"
                        className="mb-1 block font-nunito text-sm font-semibold"
                        style={{ color: 'var(--theme-text, #09151b)' }}
                      >
                        {t('phone_label')}
                      </label>
                      <input
                        id="rsvp-phone"
                        type="tel"
                        autoComplete="tel"
                        {...register('phone')}
                        className={cn(
                          'w-full rounded-xl border px-4 py-3 font-nunito text-sm outline-none transition-colors',
                          'focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]',
                          'border-[var(--theme-border,#e2e8f0)]',
                        )}
                        style={{
                          backgroundColor: 'var(--theme-surface, #ffffff)',
                          color: 'var(--theme-text, #09151b)',
                        }}
                      />
                    </div>

                    {/* Plus Ones */}
                    <div>
                      <label
                        htmlFor="rsvp-plus-ones"
                        className="mb-1 block font-nunito text-sm font-semibold"
                        style={{ color: 'var(--theme-text, #09151b)' }}
                      >
                        {t('plus_ones_label')}
                      </label>
                      <input
                        id="rsvp-plus-ones"
                        type="number"
                        min={0}
                        max={10}
                        {...register('plus_ones', { valueAsNumber: true })}
                        className={cn(
                          'w-24 rounded-xl border px-4 py-3 font-mono text-sm outline-none transition-colors',
                          'focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]',
                          'border-[var(--theme-border,#e2e8f0)]',
                        )}
                        style={{
                          backgroundColor: 'var(--theme-surface, #ffffff)',
                          color: 'var(--theme-text, #09151b)',
                        }}
                      />
                    </div>

                    {/* Dietary Restrictions */}
                    <div>
                      <label
                        htmlFor="rsvp-dietary"
                        className="mb-1 block font-nunito text-sm font-semibold"
                        style={{ color: 'var(--theme-text, #09151b)' }}
                      >
                        {t('dietary_label')}
                      </label>
                      <textarea
                        id="rsvp-dietary"
                        rows={2}
                        maxLength={300}
                        {...register('dietary_restrictions')}
                        className={cn(
                          'w-full resize-none rounded-xl border px-4 py-3 font-nunito text-sm outline-none transition-colors',
                          'focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]',
                          'border-[var(--theme-border,#e2e8f0)]',
                        )}
                        style={{
                          backgroundColor: 'var(--theme-surface, #ffffff)',
                          color: 'var(--theme-text, #09151b)',
                        }}
                      />
                    </div>

                    {/* Error message */}
                    {errorMessage && (
                      <div
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-nunito text-sm text-red-700"
                        role="alert"
                      >
                        {errorMessage}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        'flex min-h-[44px] w-full items-center justify-center rounded-[100px] px-6 font-nunito text-base font-bold',
                        'outline-none transition-opacity',
                        'hover:opacity-95',
                        'focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary-dark)]',
                        'disabled:cursor-not-allowed disabled:opacity-60',
                      )}
                      style={{
                        backgroundColor: 'var(--theme-primary)',
                        color: '#ffffff',
                      }}
                    >
                      {isSubmitting
                        ? (
                            <span className="flex items-center gap-2">
                              <svg
                                className="size-5 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                              </svg>
                              <span className="sr-only">{t('submitting')}</span>
                            </span>
                          )
                        : (
                            t('submit_button')
                          )}
                    </button>
                  </form>
                </>
              )}
        </div>
      </div>
    </FocusTrap>
  );
}

/* ------------------------------------------------------------------ */
/* Status Pill sub-component                                            */
/* ------------------------------------------------------------------ */

type StatusPillProps = {
  label: string;
  value: RsvpStatus;
  selected: boolean;
  onSelect: (status: RsvpStatus) => void;
  variant: 'green' | 'yellow' | 'neutral';
};

const pillVariants = {
  green: {
    selected: 'border-green-500 bg-green-50 text-green-800',
    idle: 'border-[var(--theme-border,#e2e8f0)] hover:border-green-300',
  },
  yellow: {
    selected: 'border-amber-500 bg-amber-50 text-amber-800',
    idle: 'border-[var(--theme-border,#e2e8f0)] hover:border-amber-300',
  },
  neutral: {
    selected: 'border-gray-500 bg-gray-50 text-gray-800',
    idle: 'border-[var(--theme-border,#e2e8f0)] hover:border-gray-300',
  },
};

function StatusPill({ label, value, selected, onSelect, variant }: StatusPillProps) {
  const styles = pillVariants[variant];

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(value)}
      className={cn(
        'flex-1 rounded-[100px] border-2 px-3 py-2.5 font-nunito text-sm font-bold transition-colors',
        'min-h-[44px] outline-none',
        'focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]',
        selected ? styles.selected : styles.idle,
      )}
    >
      {label}
    </button>
  );
}
