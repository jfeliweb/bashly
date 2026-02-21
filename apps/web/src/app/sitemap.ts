import type { MetadataRoute } from 'next';

import { getBaseUrl } from '@/utils/Helpers';

const locales = ['en', 'fr'] as const;

const marketingRoutes = [
  { path: '', changeFrequency: 'weekly' as const, priority: 1.0 },
  { path: '/about', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/features', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/pricing', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const now = new Date();

  return locales.flatMap(locale =>
    marketingRoutes.map(route => ({
      url: locale === 'en'
        ? `${baseUrl}${route.path || '/'}`
        : `${baseUrl}/${locale}${route.path || ''}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
  );
}
