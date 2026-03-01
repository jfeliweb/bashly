import { z } from 'zod';

export const guestContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(120),
  message: z.string().min(10).max(1000),
});

export type GuestContactInput = z.infer<typeof guestContactSchema>;
