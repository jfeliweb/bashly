import { Users, Music, Calendar, TrendingUp } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Card, CardContent } from '@/components/ui/card';

type StatsCardsProps = {
  stats: {
    totalRsvps: number;
    totalSongs: number;
    activeEvents: number;
    pendingSongs: number;
  };
};

const numberFormatter = new Intl.NumberFormat();

export async function StatsCards({ stats }: StatsCardsProps) {
  const t = await getTranslations('DashboardStats');

  const cards = [
    {
      title: t('total_rsvps_title'),
      value: numberFormatter.format(stats.totalRsvps),
      icon: Users,
      change: t('total_rsvps_change'),
      color: 'text-cerulean-600 dark:text-cerulean-400',
      bgColor: 'bg-cerulean-100 dark:bg-cerulean-900',
    },
    {
      title: t('song_requests_title'),
      value: numberFormatter.format(stats.totalSongs),
      icon: Music,
      change: t('song_requests_pending', {
        count: stats.pendingSongs,
      }),
      color: 'text-fern-600 dark:text-fern-400',
      bgColor: 'bg-fern-100/50 dark:bg-fern-900/20',
    },
    {
      title: t('active_events_title'),
      value: numberFormatter.format(stats.activeEvents),
      icon: Calendar,
      change: t('active_events_change'),
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
    {
      title: t('engagement_title'),
      value: '94%',
      icon: TrendingUp,
      change: t('engagement_change'),
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => (
        <Card key={card.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {card.change}
                </p>
              </div>
              <div className={`rounded-lg ${card.bgColor} p-3`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

