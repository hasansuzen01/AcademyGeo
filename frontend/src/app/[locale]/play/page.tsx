import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PlaySession } from '@/components/play-session';

export default async function PlayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('play');

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <h1 className="mb-8 text-center font-display text-3xl font-800 tracking-tight">
        {t('title')}
      </h1>
      <PlaySession />
    </div>
  );
}
