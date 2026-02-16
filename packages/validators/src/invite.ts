import { z } from 'zod';

export const createInviteSchema = z.object({
  role: z.enum(['co_host', 'coordinator', 'dj', 'guest', 'vip_guest', 'vendor']),
  max_uses: z.number().int().positive().optional(),
  expires_at: z.coerce.date().optional(),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;
