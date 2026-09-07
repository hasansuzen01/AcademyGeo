import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AtlasBrowser } from '@/components/atlas-browser';
import { WorldMap } from '@/components/world-map';
import { fetchAtlasCountries } from '@/lib/atlas-api';

export default async function AtlasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, countries] = await Promise.all([getTranslations('atlas'), fetchAtlasCountries()]);

  return (
    <div className="page-shell px-5 py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-900 tracking-tight sm:text-4xl">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted">{t('subtitle')}</p>
      </header>

      <div className="mb-8">
        <WorldMap countries={countries} />
      </div>

      <AtlasBrowser countries={countries} />
    </div>
  );
}
