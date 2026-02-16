'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type CreateEventInput, createEventSchema } from '@saas/validators';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from '@/libs/i18nNavigation';
import { cn } from '@/utils/Helpers';

const EVENT_TYPES = [
  { value: 'sweet16' as const, emoji: '👑', labelKey: 'event_type_sweet16' },
  { value: 'quinceanera' as const, emoji: '🌹', labelKey: 'event_type_quinceanera' },
  { value: 'anniversary' as const, emoji: '💍', labelKey: 'event_type_anniversary' },
  { value: 'graduation' as const, emoji: '🎓', labelKey: 'event_type_graduation' },
  { value: 'reunion' as const, emoji: '🎉', labelKey: 'event_type_reunion' },
  { value: 'birthday' as const, emoji: '🎂', labelKey: 'event_type_birthday' },
  { value: 'custom' as const, emoji: '✨', labelKey: 'event_type_custom' },
] as const;

const THEMES = [
  { id: 'theme1' as const, labelKey: 'theme_1', gradient: 'from-rose-400 to-pink-500' },
  { id: 'theme2' as const, labelKey: 'theme_2', gradient: 'from-violet-400 to-purple-500' },
  { id: 'theme3' as const, labelKey: 'theme_3', gradient: 'from-amber-400 to-orange-500' },
  { id: 'theme4' as const, labelKey: 'theme_4', gradient: 'from-emerald-400 to-teal-500' },
  { id: 'theme5' as const, labelKey: 'theme_5', gradient: 'from-sky-400 to-blue-500' },
] as const;

const createEventFormSchema = createEventSchema.omit({
  event_date: true,
  doors_open_at: true,
}).extend({
  event_date_str: z.string().optional(),
  event_time_str: z.string().optional(),
});

type CreateEventFormValues = z.infer<typeof createEventFormSchema>;

const defaultFormValues: CreateEventFormValues = {
  event_type: 'sweet16',
  title: '',
  event_date_str: '',
  event_time_str: '',
  venue_name: '',
  venue_address: '',
  dress_code: '',
  welcome_message: '',
  theme_id: 'theme1',
  address_visible: 'after_rsvp',
  song_requests_enabled: true,
  song_requests_per_guest: 5,
  song_voting_enabled: false,
  registry_enabled: true,
};

function buildApiPayload(values: CreateEventFormValues): CreateEventInput {
  const event_date
    = values.event_date_str && values.event_time_str
      ? new Date(`${values.event_date_str}T${values.event_time_str}`)
      : undefined;
  return {
    event_type: values.event_type,
    title: values.title,
    event_date,
    venue_name: values.venue_name || undefined,
    venue_address: values.venue_address || undefined,
    dress_code: values.dress_code || undefined,
    welcome_message: values.welcome_message || undefined,
    theme_id: values.theme_id,
    address_visible: values.address_visible,
    song_requests_enabled: values.song_requests_enabled,
    song_requests_per_guest: values.song_requests_per_guest,
    song_voting_enabled: values.song_voting_enabled,
    registry_enabled: values.registry_enabled,
  };
}

export default function NewEventPage() {
  const t = useTranslations('CreateEvent');
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues: defaultFormValues,
  });

  const eventType = form.watch('event_type');
  const welcomeMessage = form.watch('welcome_message') ?? '';

  const onStep1Select = (value: CreateEventFormValues['event_type']) => {
    form.setValue('event_type', value);
    setStep(2);
    setTimeout(() => document.getElementById('event-title')?.focus(), 0);
  };

  const onStep2Next = async () => {
    const ok = await form.trigger([
      'title',
      'event_date_str',
      'event_time_str',
      'venue_name',
      'venue_address',
      'dress_code',
      'welcome_message',
    ]);
    if (ok) {
      setStep(3);
      setTimeout(() => document.getElementById('theme-btn-1')?.focus(), 0);
    }
  };

  const onSubmit = async (values: CreateEventFormValues) => {
    const payload = buildApiPayload(values);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data?.error ?? t('error_toast');
        setApiError(message);
        return;
      }
      if (data?.event?.id) {
        router.push(`/dashboard/events/${data.event.id}`);
      } else {
        setApiError(t('error_toast'));
      }
    } catch {
      setApiError(t('error_toast'));
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="mx-auto max-w-2xl">
      <div
        className="mb-8 font-mono text-sm font-semibold text-muted-foreground"
        aria-label={t('step_indicator', { n: step })}
      >
        {t('step_indicator', { n: step })}
      </div>

      {apiError && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {apiError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {step === 1 && (
            <section aria-label={t('step_1_heading')}>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                {t('step_1_heading')}
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {EVENT_TYPES.map(({ value, emoji, labelKey }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onStep1Select(value)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[rgb(37,90,116)] focus-visible:outline-offset-[3px]',
                      eventType === value
                        ? 'border-[rgb(48,153,0)] bg-[rgb(238,255,229)] dark:border-[rgb(116,255,51)] dark:bg-[rgb(116,255,51)]/10'
                        : 'border-border bg-card hover:border-muted-foreground/30',
                    )}
                  >
                    <span className="text-2xl" aria-hidden>
                      {emoji}
                    </span>
                    <span className="text-sm font-bold">
                      {t(labelKey)}
                    </span>
                    {eventType === value && (
                      <span className="size-5 text-[rgb(48,153,0)] dark:text-[rgb(116,255,51)]" aria-hidden>
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 2 && (
            <section aria-label={t('step_2_heading')}>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                {t('step_2_heading')}
              </h2>
              <div className="mt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="event-title">{t('event_name_label')}</FormLabel>
                      <FormControl>
                        <Input
                          id="event-title"
                          placeholder={t('event_name_placeholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="event_date_str"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="event-date">{t('date_label')}</FormLabel>
                        <FormControl>
                          <Input id="event-date" type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="event_time_str"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="event-time">{t('time_label')}</FormLabel>
                        <FormControl>
                          <Input id="event-time" type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="venue_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="venue-name">{t('venue_name_label')}</FormLabel>
                      <FormControl>
                        <Input id="venue-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="venue_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="venue-address">{t('venue_address_label')}</FormLabel>
                      <FormControl>
                        <Input id="venue-address" {...field} />
                      </FormControl>
                      <FormDescription>{t('venue_address_help')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dress_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="dress-code">{t('dress_code_label')}</FormLabel>
                      <FormControl>
                        <Input id="dress-code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="welcome_message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="welcome-message">{t('welcome_message_label')}</FormLabel>
                      <FormControl>
                        <Textarea
                          id="welcome-message"
                          placeholder={t('welcome_message_placeholder')}
                          maxLength={1000}
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('char_count', { current: welcomeMessage.length, max: 1000 })}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-8 flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="min-h-[44px]"
                >
                  {t('back')}
                </Button>
                <Button
                  type="button"
                  onClick={onStep2Next}
                  className="min-h-[44px] rounded-[100px] bg-[rgb(81,255,0)] font-bold text-[rgb(9,21,27)] hover:bg-[rgb(65,204,0)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
                >
                  {t('next')}
                </Button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section aria-label={t('step_3_heading')}>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                {t('step_3_heading')}
              </h2>
              <div className="mt-6 space-y-6">
                <FormField
                  control={form.control}
                  name="theme_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('theme_label')}</FormLabel>
                      <div className="flex flex-wrap gap-3">
                        {THEMES.map(({ id, labelKey, gradient }, idx) => (
                          <button
                            key={id}
                            id={idx === 0 ? 'theme-btn-1' : undefined}
                            type="button"
                            onClick={() => field.onChange(id)}
                            className={cn(
                              'relative flex h-14 w-14 items-center justify-center rounded-lg border-2 bg-gradient-to-br text-xs font-medium focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[rgb(37,90,116)] focus-visible:outline-offset-[3px]',
                              gradient,
                              field.value === id
                                ? 'border-[rgb(48,153,0)] ring-2 ring-[rgb(48,153,0)] dark:border-[rgb(116,255,51)] dark:ring-[rgb(116,255,51)]'
                                : 'border-border',
                            )}
                            aria-pressed={field.value === id}
                            aria-label={t(labelKey)}
                          >
                            {field.value === id && (
                              <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 text-white" aria-hidden>
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="song_requests_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <FormLabel htmlFor="song-requests" className="cursor-pointer">
                        {t('song_requests_label')}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          id="song-requests"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          role="switch"
                          aria-checked={field.value}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="song_voting_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <FormLabel htmlFor="song-voting" className="cursor-pointer">
                        {t('song_voting_label')}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          id="song-voting"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          role="switch"
                          aria-checked={field.value}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registry_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <FormLabel htmlFor="registry" className="cursor-pointer">
                        {t('gift_registry_label')}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          id="registry"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          role="switch"
                          aria-checked={field.value}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address_visible"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="address-visible">{t('address_visibility_label')}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger id="address-visible">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="after_rsvp">{t('address_after_rsvp')}</SelectItem>
                          <SelectItem value="always">{t('address_always')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-8 flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(2)}
                  className="min-h-[44px]"
                >
                  {t('back')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[44px] rounded-[100px] bg-[rgb(81,255,0)] font-bold text-[rgb(9,21,27)] hover:bg-[rgb(65,204,0)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)] disabled:opacity-70"
                >
                  {isSubmitting ? t('creating') : t('create_button')}
                </Button>
              </div>
            </section>
          )}
        </form>
      </Form>
    </div>
  );
}
