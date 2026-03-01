import { getTranslations } from 'next-intl/server';

const eventKeys = [
  { key: 'sweet16', emoji: '🎂', color: 'bg-pink-100 dark:bg-pink-900/20' },
  { key: 'graduation', emoji: '🎓', color: 'bg-blue-100 dark:bg-blue-900/20' },
  { key: 'quinceanera', emoji: '👑', color: 'bg-purple-100 dark:bg-purple-900/20' },
  { key: 'anniversary', emoji: '💍', color: 'bg-red-100 dark:bg-red-900/20' },
  { key: 'reunion', emoji: '👨‍👩‍👧‍👦', color: 'bg-green-100 dark:bg-green-900/20' },
  { key: 'birthday', emoji: '🎉', color: 'bg-yellow-100 dark:bg-yellow-900/20' },
] as const;

export async function EventShowcase() {
  const t = await getTranslations('EventShowcase');

  return (
    <section
      className="bg-white py-24 dark:bg-background sm:py-32"
      aria-labelledby="event-showcase-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="event-showcase-heading"
            className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            {t('section_title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('section_description')}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {eventKeys.map(({ key, emoji, color }) => (
            <div
              key={key}
              className={`flex flex-col items-center rounded-xl p-6 text-center ${color} motion-safe:transition-transform motion-safe:hover:scale-105 motion-reduce:transition-none`}
            >
              <span className="text-4xl" aria-hidden>
                {emoji}
              </span>
              <h3 className="mt-3 font-semibold text-foreground">
                {t(`${key}_title`)}
              </h3>
              <p className="mt-1 text-xs text-foreground">
                {t(`${key}_description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
