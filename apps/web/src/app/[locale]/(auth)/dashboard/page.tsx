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

const DashboardIndexPage = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold">Welcome to Bashly 🎉</h1>
      <p className="mt-2 text-muted-foreground">Your events dashboard is coming soon.</p>
    </div>
  );
};

export default DashboardIndexPage;
