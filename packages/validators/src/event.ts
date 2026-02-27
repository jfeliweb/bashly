import { z } from 'zod';

export const eventTypeSchema = z.enum([
  'sweet16',
  'quinceanera',
  'anniversary',
  'graduation',
  'reunion',
  'birthday',
  'custom',
]);

export const createEventSchema = z.object({
  title: z.string().min(1).max(100),
  event_type: eventTypeSchema,
  description: z.string().max(500).optional(),
  event_date: z.coerce.date().optional(),
  doors_open_at: z.coerce.date().optional(),
  venue_name: z.string().max(200).optional(),
  venue_address: z.string().max(300).optional(),
  venue_notes: z.string().max(500).optional(),
  dress_code: z.string().max(200).optional(),
  welcome_message: z.string().max(1000).optional(),
  max_capacity: z.number().int().positive().optional(),
  rsvp_deadline: z.coerce.date().optional(),
  theme_id: z.enum(['theme1', 'theme2', 'theme3', 'theme4', 'theme5']).default('theme1'),
  address_visible: z.enum(['always', 'after_rsvp']).default('after_rsvp'),
  song_requests_enabled: z.boolean().default(true),
  song_requests_per_guest: z.number().int().min(0).max(20).default(5),
  song_voting_enabled: z.boolean().default(false),
  registry_enabled: z.boolean().default(true),
  private_notes: z.string().max(2000).optional(),
  cover_image_url: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
  cover_image_key: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export const updateEventSchema = createEventSchema
  .partial()
  .extend({ status: z.enum(['draft', 'published', 'completed', 'cancelled']).optional() });

export const scheduleItemSchema = z.object({
  start_time: z.string().min(1).max(20),
  title: z.string().min(1).max(200),
  note: z.string().max(500).optional(),
  sort_order: z.number().int().min(0).default(0),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ScheduleItemInput = z.infer<typeof scheduleItemSchema>;
