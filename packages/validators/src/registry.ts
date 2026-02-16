import { z } from 'zod';

export const registryLinkSchema = z.object({
  display_name: z.string().min(1).max(100),
  url: z.string().url('Must be a valid URL'),
  sort_order: z.number().int().min(0).default(0),
});

export type RegistryLinkInput = z.infer<typeof registryLinkSchema>;
