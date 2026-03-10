import { z } from 'zod';

export const rsvpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  phone: z.string().max(20).optional(),
  plus_ones: z.preprocess(
    (v) => (v === '' || (typeof v === 'number' && Number.isNaN(v)) ? 0 : v),
    z.number().int().min(0).max(10),
  ),
  dietary_restrictions: z.string().max(300).optional(),
  status: z.enum(['attending', 'declined', 'maybe']).default('attending'),
  fingerprint: z.string().optional(),
  invite_code: z.string().max(50).optional(),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;
