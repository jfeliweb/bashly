import { getTranslations } from 'next-intl/server';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Dashboard',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const OrganizationSelectionPage = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-center">Select Organization</h1>
      <p className="text-sm text-muted-foreground text-center">
        Choose or create an organization to continue.
      </p>
    </div>
  </div>
);

export const dynamic = 'force-dynamic';

export default OrganizationSelectionPage;
