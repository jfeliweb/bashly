import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { TitleBar } from '@/features/dashboard/TitleBar';

type PageProps = {
  searchParams: Promise<{ eventId?: string }>;
};

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'CheckoutConfirmation',
  });
  return {
    title: t('title_bar'),
  };
}

export default async function CheckoutConfirmationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const t = await getTranslations('CheckoutConfirmation');

  const eventId = params.eventId;
  const backHref = eventId
    ? `/dashboard/events/${eventId}`
    : '/dashboard/billing';

  return (
    <>
      <TitleBar title={t('title_bar')} />

      <div
        role="status"
        className="flex flex-col items-center gap-6 rounded-xl border border-border bg-card p-8 text-center"
      >
        <h2 className="text-xl font-bold text-foreground">
          {t('message_state_title')}
        </h2>
        <p className="text-muted-foreground">
          {t('message_state_description')}
        </p>
        <Button asChild>
          <Link
            href={backHref}
            className="min-h-[44px] rounded-[100px] bg-[rgb(81,255,0)] px-6 font-bold text-[rgb(9,21,27)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--focus-ring)]"
          >
            {t('message_state_button')}
          </Link>
        </Button>
      </div>
    </>
  );
}
