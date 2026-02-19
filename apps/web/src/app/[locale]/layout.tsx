import '@/styles/event-themes.css';
import '@/styles/global.css';

import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono, Nunito } from 'next/font/google';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';

import { DemoBadge } from '@/components/DemoBadge';
import { AllLocales } from '@/utils/AppConfig';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Bashly',
    default: 'Bashly - Unforgettable Events, Effortlessly Planned',
  },
  description:
    'Plan Sweet 16s, graduations, and celebrations with RSVP management, song requests, and streaming playlist export. Free to start.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export function generateStaticParams() {
  return AllLocales.map(locale => ({ locale }));
}

export default function RootLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(props.params.locale);

  // Using internationalization in Client Components
  const messages = useMessages();

  // The `suppressHydrationWarning` in <html> is used to prevent hydration errors caused by `next-themes`.
  // Solution provided by the package itself: https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app

  // The `suppressHydrationWarning` attribute in <body> is used to prevent hydration errors caused by Sentry Overlay,
  // which dynamically adds a `style` attribute to the body tag.
  return (
    <html
      lang={props.params.locale}
      className={`${bricolage.variable} ${nunito.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        {/* PRO: Dark mode support for Shadcn UI */}
        <NextIntlClientProvider
          locale={props.params.locale}
          messages={messages}
        >
          {props.children}

          <DemoBadge />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
