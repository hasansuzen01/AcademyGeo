import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { CountryPage } from '@/components/country-page';
import { fetchAtlasCountries, fetchAtlasCountry } from '@/lib/atlas-api';

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
  const country = await fetchAtlasCountry(code);
  if (!country) return {};

  const name = locale === 'tr' ? country.nameTr : country.nameEn;
  const summary = locale === 'tr' ? country.summaryTr : country.summaryEn;

  return { title: name, description: summary || undefined };
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
