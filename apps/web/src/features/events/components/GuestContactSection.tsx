'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { guestContactSchema } from '@saas/validators';
import { MessageCircle, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type GuestContactFormValues = z.infer<typeof guestContactSchema>;

type GuestContactSectionProps = {
  eventSlug: string;
  showForm: boolean;
  showPhone: boolean;
  phone?: string | null;
  showLockedHint?: boolean;
};

export function GuestContactSection({
  eventSlug,
  showForm,
  showPhone,
  phone,
  showLockedHint,
}: GuestContactSectionProps) {
  const t = useTranslations('Contact');

  const form = useForm<GuestContactFormValues>({
    resolver: zodResolver(guestContactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (values: GuestContactFormValues) => {
    try {
      const res = await fetch(`/api/contact/${eventSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = (await res.json().catch(() => null)) as { error?: string } | null;

      if (!res.ok) {
        toast.error(data?.error ?? t('form_error'));
        return;
      }

      toast.success(t('form_success'));
      form.reset();
    } catch {
      toast.error(t('form_error'));
    }
  };

  return (
    <section
      aria-labelledby="contact-heading"
      className="mb-4 rounded-2xl border bg-[var(--theme-surface)] p-4 shadow-sm"
      style={{ borderColor: 'var(--theme-border)' }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-xl bg-[var(--theme-primary-light)] p-2 text-[var(--theme-primary)]">
          <MessageCircle className="size-4" aria-hidden />
        </span>
        <h2
          id="contact-heading"
          className="font-nunito text-sm font-bold text-[var(--theme-text)]"
        >
          {t('section_heading')}
        </h2>
      </div>

      {showPhone && phone && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border px-4 py-3" style={{ borderColor: 'var(--theme-border)' }}>
          <Phone className="size-4 text-[var(--theme-primary)]" aria-hidden />
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="font-mono text-sm font-semibold text-[var(--theme-text)] outline-none hover:underline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]"
          >
            {phone}
          </a>
        </div>
      )}

      {showForm && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="contact-name">{t('form_name')}</FormLabel>
                  <FormControl>
                    <Input
                      id="contact-name"
                      placeholder={t('form_name')}
                      {...field}
                      className="focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="contact-email">{t('form_email')}</FormLabel>
                  <FormControl>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder={t('form_email')}
                      {...field}
                      className="focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="contact-subject">{t('form_subject')}</FormLabel>
                  <FormControl>
                    <Input
                      id="contact-subject"
                      placeholder={t('form_subject')}
                      {...field}
                      className="focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="contact-message">{t('form_message')}</FormLabel>
                  <FormControl>
                    <Textarea
                      id="contact-message"
                      placeholder={t('form_message_placeholder')}
                      className="min-h-[100px] focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="min-h-[44px] w-full rounded-[100px] bg-[rgb(81,255,0)] font-bold text-[rgb(9,21,27)] hover:bg-[rgb(65,204,0)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)] disabled:opacity-70"
            >
              {form.formState.isSubmitting ? '…' : t('form_submit')}
            </Button>
          </form>
        </Form>
      )}

      {!showForm && !showPhone && showLockedHint && (
        <p
          className="font-nunito text-sm italic text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]"
          role="status"
        >
          {t('locked_hint')}
        </p>
      )}
    </section>
  );
}
