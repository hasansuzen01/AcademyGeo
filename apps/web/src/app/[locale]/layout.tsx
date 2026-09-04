import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { routing } from '@/i18n/routing';
import { fetchSiteSeo } from '@/lib/content-api';
import { buildMetadata } from '@/lib/metadata';
import { SearchEngineTags } from '@/components/search-engine-tags';
import '../globals.css';

// One rounded face across the whole app. The weight range carries the
// hierarchy so the interface stays friendly rather than typographic.
const nunito = Nunito({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-nunito',
});

/**
 * Head tags for every page under a locale, from the settings an admin edits.
 * A page with its own metadata replaces these rather than adding to them.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const site = await fetchSiteSeo();

  return {
    ...buildMetadata({ site, path: `/${locale}` }),
    verification: {
      ...(site.googleSiteVerification ? { google: site.googleSiteVerification } : {}),
      ...(site.bingSiteVerification
        ? { other: { 'msvalidate.01': site.bingSiteVerification } }
        : {}),
    },
  };
}

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
      <body className="flex min-h-screen flex-col bg-canvas text-ink antialiased">
        <NextIntlClientProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter locale={locale} />
        </NextIntlClientProvider>
        <SearchEngineTags />
      </body>
    </html>
  );
}
