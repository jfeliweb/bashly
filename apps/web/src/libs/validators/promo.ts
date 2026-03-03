import { z } from 'zod';

export const validatePromoSchema = z.object({
  code: z.string().min(1).max(64).transform(value => value.toUpperCase().trim()),
  eventId: z.string().uuid(),
});

export type ValidatePromoInput = z.infer<typeof validatePromoSchema>;
