import { z } from 'zod';

export const rsvpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  plus_ones: z.number().int().min(0).max(10).default(0),
  dietary_restrictions: z.string().max(300).optional(),
  status: z.enum(['attending', 'declined', 'maybe']).default('attending'),
  fingerprint: z.string().optional(),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;
