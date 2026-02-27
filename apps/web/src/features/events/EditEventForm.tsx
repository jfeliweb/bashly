'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createEventSchema } from '@saas/validators';
import { ImagePlus, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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

const THEMES = [
  { id: 'theme1' as const, labelKey: 'theme_1', gradient: 'from-violet-400 to-purple-500' },
  { id: 'theme2' as const, labelKey: 'theme_2', gradient: 'from-sky-400 to-cyan-500' },
  { id: 'theme3' as const, labelKey: 'theme_3', gradient: 'from-amber-400 to-orange-500' },
  { id: 'theme4' as const, labelKey: 'theme_4', gradient: 'from-emerald-400 to-lime-500' },
  { id: 'theme5' as const, labelKey: 'theme_5', gradient: 'from-pink-500 to-rose-500' },
] as const;

const editFormSchema = createEventSchema
  .omit({ event_date: true, doors_open_at: true })
  .extend({
    event_date_str: z.string().optional(),
    event_time_str: z.string().optional(),
  });

type EditEventFormValues = z.infer<typeof editFormSchema>;

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export type EditEventFormDefaults = EditEventFormValues;

function buildPatchPayload(values: EditEventFormValues): Record<string, unknown> {
  const event_date
    = values.event_date_str && values.event_time_str
      ? new Date(`${values.event_date_str}T${values.event_time_str}`)
      : undefined;
  return {
    ...(values.title !== undefined && { title: values.title }),
    ...(values.event_type !== undefined && { event_type: values.event_type }),
    ...(event_date !== undefined && { event_date: event_date.toISOString() }),
    ...(values.venue_name !== undefined && { venue_name: values.venue_name || undefined }),
    ...(values.venue_address !== undefined && { venue_address: values.venue_address || undefined }),
    ...(values.dress_code !== undefined && { dress_code: values.dress_code || undefined }),
    ...(values.welcome_message !== undefined && { welcome_message: values.welcome_message || undefined }),
    ...(values.theme_id !== undefined && { theme_id: values.theme_id }),
    ...(values.address_visible !== undefined && { address_visible: values.address_visible }),
    ...(values.song_requests_enabled !== undefined && { song_requests_enabled: values.song_requests_enabled }),
    ...(values.song_requests_per_guest !== undefined && { song_requests_per_guest: values.song_requests_per_guest }),
    ...(values.song_voting_enabled !== undefined && { song_voting_enabled: values.song_voting_enabled }),
    ...(values.registry_enabled !== undefined && { registry_enabled: values.registry_enabled }),
    ...(values.cover_image_url !== undefined && { cover_image_url: values.cover_image_url || undefined }),
    ...(values.cover_image_key !== undefined && { cover_image_key: values.cover_image_key || undefined }),
  };
}

type EditEventFormProps = {
  eventId: string;
  defaultValues: EditEventFormDefaults;
};

export function EditEventForm({ eventId, defaultValues }: EditEventFormProps) {
  const t = useTranslations('CreateEvent');
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    defaultValues.cover_image_url || null,
  );
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EditEventFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: defaultValues as EditEventFormValues,
  });

  const welcomeMessage = form.watch('welcome_message') ?? '';

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setCoverError(t('cover_upload_error'));
        return;
      }
      setCoverError(null);
      setCoverUploading(true);
      const previewUrl = URL.createObjectURL(file);
      setCoverPreview(previewUrl);
      try {
        const res = await fetch('/api/upload/presign', {
          method: 'POST',
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            eventId,
          }),
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          throw new Error('Presign failed');
        }
        const { uploadUrl, objectKey, publicUrl } = (await res.json()) as {
          uploadUrl: string;
          objectKey: string;
          publicUrl: string;
        };
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        form.setValue('cover_image_key', objectKey);
        form.setValue('cover_image_url', publicUrl);
      } catch {
        setCoverPreview(defaultValues.cover_image_url || null);
        setCoverError(t('cover_upload_error'));
      } finally {
        setCoverUploading(false);
      }
    },
    [eventId, form, defaultValues.cover_image_url, t],
  );

  const handleRemoveCover = useCallback(() => {
    setCoverPreview(null);
    setCoverError(null);
    form.setValue('cover_image_key', undefined);
    form.setValue('cover_image_url', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [form]);

  const onSubmit = async (values: EditEventFormValues) => {
    setApiError(null);
    const payload = buildPatchPayload(values);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        const msg = data?.error ?? t('error_toast_edit');
        setApiError(msg);
        toast.error(msg);
        return;
      }
      toast.success(t('success_toast_edit'));
      router.refresh();
    } catch {
      setApiError(t('error_toast_edit'));
      toast.error(t('error_toast_edit'));
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {apiError && (
          <div
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {apiError}
          </div>
        )}

        <section aria-label={t('step_2_heading')}>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {t('step_2_heading')}
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {t('cover_photo_label')}
              </p>
              <div className="mt-2">
                {coverPreview
                  ? (
                      <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-xl border border-border">
                        <Image
                          src={coverPreview}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {coverUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Loader2 className="size-8 animate-spin text-white" />
                          </div>
                        )}
                        {!coverUploading && (
                          <button
                            type="button"
                            onClick={handleRemoveCover}
                            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
                            aria-label={t('cover_remove')}
                          >
                            <X className="size-4" />
                          </button>
                        )}
                      </div>
                    )
                  : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-10 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
                      >
                        <ImagePlus className="size-8" />
                        <span className="text-sm font-semibold">{t('cover_upload_button')}</span>
                      </button>
                    )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(file);
                    }
                  }}
                  aria-label={t('cover_photo_label')}
                />
                {coverError && (
                  <p className="mt-1 text-sm text-destructive">{coverError}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{t('cover_photo_help')}</p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="edit-event-title">{t('event_name_label')}</FormLabel>
                  <FormControl>
                    <Input id="edit-event-title" placeholder={t('event_name_placeholder')} {...field} />
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
                    <FormLabel htmlFor="edit-event-date">{t('date_label')}</FormLabel>
                    <FormControl>
                      <Input id="edit-event-date" type="date" {...field} />
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
                    <FormLabel htmlFor="edit-event-time">{t('time_label')}</FormLabel>
                    <FormControl>
                      <Input id="edit-event-time" type="time" {...field} />
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
                  <FormLabel htmlFor="edit-venue-name">{t('venue_name_label')}</FormLabel>
                  <FormControl>
                    <Input id="edit-venue-name" {...field} />
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
                  <FormLabel htmlFor="edit-venue-address">{t('venue_address_label')}</FormLabel>
                  <FormControl>
                    <Input id="edit-venue-address" {...field} />
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
                  <FormLabel htmlFor="edit-dress-code">{t('dress_code_label')}</FormLabel>
                  <FormControl>
                    <Input id="edit-dress-code" {...field} />
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
                  <FormLabel htmlFor="edit-welcome-message">{t('welcome_message_label')}</FormLabel>
                  <FormControl>
                    <Textarea
                      id="edit-welcome-message"
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
        </section>

        <section aria-label={t('step_3_heading')}>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {t('step_3_heading')}
          </h2>
          <div className="mt-4 space-y-6">
            <FormField
              control={form.control}
              name="theme_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('theme_label')}</FormLabel>
                  <div className="flex flex-wrap gap-3">
                    {THEMES.map(({ id, labelKey, gradient }) => (
                      <button
                        key={id}
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
                          <span
                            className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 text-white"
                            aria-hidden
                          >
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
                  <FormLabel htmlFor="edit-song-requests" className="cursor-pointer">
                    {t('song_requests_label')}
                  </FormLabel>
                  <FormControl>
                    <Switch
                      id="edit-song-requests"
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
              name="song_requests_per_guest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="edit-songs-per-guest">{t('songs_per_guest_label')}</FormLabel>
                  <FormControl>
                    <Input
                      id="edit-songs-per-guest"
                      type="number"
                      min={0}
                      max={20}
                      {...field}
                      onChange={(e) => {
                        const n = e.target.valueAsNumber;
                        field.onChange(Number.isFinite(n) ? n : 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="song_voting_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel htmlFor="edit-song-voting" className="cursor-pointer">
                    {t('song_voting_label')}
                  </FormLabel>
                  <FormControl>
                    <Switch
                      id="edit-song-voting"
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
                  <FormLabel htmlFor="edit-registry" className="cursor-pointer">
                    {t('gift_registry_label')}
                  </FormLabel>
                  <FormControl>
                    <Switch
                      id="edit-registry"
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
                  <FormLabel htmlFor="edit-address-visible">{t('address_visibility_label')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger id="edit-address-visible">
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
        </section>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-h-[44px] w-full rounded-[100px] bg-[rgb(81,255,0)] font-bold text-[rgb(9,21,27)] hover:bg-[rgb(65,204,0)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)] disabled:opacity-70"
        >
          {isSubmitting ? t('saving') : t('save_button')}
        </Button>
      </form>
    </Form>
  );
}
