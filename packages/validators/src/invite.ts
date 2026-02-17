import { z } from 'zod';

export const createInviteSchema = z.object({
  role: z.enum(['owner', 'co_host', 'coordinator', 'dj', 'guest', 'vip_guest', 'vendor']),
  max_uses: z.number().int().positive().optional(),
  expires_at: z.string().datetime().optional(),
  email: z.string().email().optional(),
  message: z.string().max(500).optional(),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;
