import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AtlasBrowser } from '@/components/atlas-browser';
import { fetchAtlasCountries } from '@/lib/atlas-api';

export default async function AtlasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, countries] = await Promise.all([getTranslations('atlas'), fetchAtlasCountries()]);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-800 tracking-tight sm:text-4xl">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted">{t('subtitle')}</p>
      </header>

      <AtlasBrowser countries={countries} />
    </div>
  );
}
