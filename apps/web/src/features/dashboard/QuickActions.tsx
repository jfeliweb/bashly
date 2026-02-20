"use client";

import { Plus, Upload, Share2, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type QuickAction = {
  icon: typeof Plus;
  label: string;
  description: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
};

export function QuickActions() {
  const t = useTranslations('DashboardQuickActions');
  const router = useRouter();

  const actions: QuickAction[] = [
    {
      icon: Plus,
      label: t('create_event_label'),
      description: t('create_event_description'),
      href: '/dashboard/events/new',
      onClick: () => {
        router.push('/dashboard/events/new');
      },
    },
    {
      icon: Share2,
      label: t('share_link_label'),
      description: t('share_link_description'),
      onClick: () => {
        // Sharing logic will be implemented in a later step.
      },
    },
    {
      icon: Download,
      label: t('export_guests_label'),
      description: t('export_guests_description'),
      onClick: () => {
        // Export logic will be implemented in a later step.
      },
    },
    {
      icon: Upload,
      label: t('import_guests_label'),
      description: t('import_guests_description'),
      href: '/dashboard/import',
      badge: t('soon_badge'),
      onClick: () => {
        // Import flow will be enabled in a later release.
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {actions.map(action => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            disabled={Boolean(action.badge)}
            className="relative flex items-start gap-3 rounded-lg border border-cerulean-200 p-4 text-left transition-colors hover:bg-cerulean-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-cerulean-800 dark:hover:bg-cerulean-950/50"
          >
            <div className="mt-1 rounded-lg bg-cerulean-100 p-2 dark:bg-cerulean-900">
              <action.icon className="h-5 w-5 text-cerulean-600 dark:text-cerulean-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{action.label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {action.description}
              </p>
            </div>
            {action.badge && (
              <span className="absolute -right-2 -top-2 rounded-full bg-fern-500 px-2 py-0.5 text-xs font-semibold text-cerulean-950">
                {action.badge}
              </span>
            )}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

