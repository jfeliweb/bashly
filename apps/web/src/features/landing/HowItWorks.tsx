import { getTranslations } from 'next-intl/server';

const stepKeys = ['1', '2', '3', '4'] as const;

export async function HowItWorks() {
  const t = await getTranslations('HowItWorks');

  return (
    <section
      className="bg-cerulean-50 dark:bg-cerulean-950/50 py-24 sm:py-32"
      aria-labelledby="how-it-works-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="how-it-works-heading"
            className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            {t('section_title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('section_description')}
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stepKeys.map((step) => (
              <div key={step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-fern-500 font-heading text-xl font-bold text-cerulean-950"
                    aria-hidden
                  >
                    {step}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {t(`step_${step}_title`)}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(`step_${step}_description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
