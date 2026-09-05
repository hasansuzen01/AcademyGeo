import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ModeHub } from '@/components/mode-hub';

export default async function PlayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('games');

  return (
    <div className="page-shell px-5 py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-800 tracking-tight sm:text-4xl">
          {t('hub.title')}
        </h1>
        <p className="mt-2 text-sm text-muted">{t('hub.subtitle')}</p>
      </header>

      <ModeHub />
    </div>
  );
}
