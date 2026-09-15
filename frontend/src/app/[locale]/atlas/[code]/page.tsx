import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { CountryPage } from '@/components/country-page';
import { fetchAtlasCountries, fetchAtlasCountry } from '@/lib/atlas-api';
import { fetchSiteSeo } from '@/lib/content-api';
import { buildMetadata } from '@/lib/metadata';

/**
 * The countries worth building ahead of time.
 *
 * Empty when the API is not up, which it is not while the image is being
 * built. Every country page is still reachable: an address that was not
 * listed here is rendered the first time somebody asks for it.
 */
export async function generateStaticParams() {
  const countries = await fetchAtlasCountries();

  return countries.map((country) => ({ code: country.code.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}): Promise<Metadata> {
  const { locale, code } = await params;
  const [country, site, t] = await Promise.all([
    fetchAtlasCountry(code),
    fetchSiteSeo(),
    getTranslations({ locale, namespace: 'atlas' }),
  ]);
  if (!country) return {};

  const name = locale === 'tr' ? country.nameTr : country.nameEn;
  const summary = locale === 'tr' ? country.summaryTr : country.summaryEn;

  // The path is spelled the way the sitemap lists it, lower case, so the
  // canonical link and the sitemap name the same address.
  return buildMetadata({
    site,
    path: `/${locale}/atlas/${country.code.toLowerCase()}`,
    title: t('countryMetaTitle', { country: name }),
    description: summary || t('countryMetaDescription', { country: name }),
  });
}

export default async function AtlasCountryPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  setRequestLocale(locale);

  const country = await fetchAtlasCountry(code);
  if (!country) notFound();

  return <CountryPage country={country} />;
}
