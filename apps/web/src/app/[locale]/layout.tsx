import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { SiteHeader } from '@/components/site-header';
import { routing } from '@/i18n/routing';
import '../globals.css';

// One rounded face across the whole app. The weight range carries the
// hierarchy so the interface stays friendly rather than typographic.
const nunito = Nunito({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'AcademyGeo',
  description: 'Train the static clues that decide a GeoGuessr round.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    <html lang={locale} className={nunito.variable}>
      <body className="min-h-screen bg-canvas text-ink antialiased">
        <NextIntlClientProvider>
          <SiteHeader />
          <main>{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
