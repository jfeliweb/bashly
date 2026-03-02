import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { db } from '@/libs/DB';
import { eventTable } from '@/models/Schema';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function formatEventDate(date: Date | null): string {
  if (!date) {
    return '';
  }
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export default async function RsvpConfirmedPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations('RsvpConfirmed');

  const nameParam = resolvedSearchParams.name;
  const name = typeof nameParam === 'string' ? nameParam : null;

  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.slug, slug),
    columns: {
      title: true,
      eventDate: true,
      themeId: true,
      slug: true,
      status: true,
    },
  });

  if (!event) {
    notFound();
  }
  if (event.status === 'archived') {
    notFound();
  }

  const themeId = event.themeId ?? 'theme1';
  const formattedDate = formatEventDate(event.eventDate);

  return (
    <div
      className={`event-theme-${themeId} min-h-screen`} // eslint-disable-line tailwindcss/no-custom-classname -- dynamic theme
      style={{
        backgroundColor: 'var(--theme-surface)',
        color: 'var(--theme-text)',
      }}
    >
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
        <span className="mb-4 text-6xl" role="img" aria-label="celebration">
          🎉
        </span>

        <h1
          className="mb-2 font-bricolage text-3xl font-extrabold sm:text-4xl"
          style={{ color: 'var(--theme-text)' }}
        >
          {name
            ? t('heading_with_name', { name })
            : t('heading')}
        </h1>

        <p
          className="mb-1 font-nunito text-lg"
          style={{ color: 'var(--theme-text)' }}
        >
          {event.title}
        </p>

        {formattedDate && (
          <p
            className="mb-8 font-mono text-sm font-semibold"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            {formattedDate}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/e/${event.slug}#songs`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-[100px] px-8 font-nunito text-base font-bold text-white outline-none transition-opacity hover:opacity-95 focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary-dark)]"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            {t('request_song')}
          </Link>

          <Link
            href={`/e/${event.slug}`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-[100px] border-2 px-8 font-nunito text-base font-bold outline-none transition-opacity hover:opacity-80 focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]"
            style={{
              borderColor: 'var(--theme-primary)',
              color: 'var(--theme-primary)',
            }}
          >
            {t('view_event')}
          </Link>
        </div>
      </div>
    </div>
  );
}
