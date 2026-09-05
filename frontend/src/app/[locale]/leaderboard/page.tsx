import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LeaderboardView } from '@/components/leaderboard-view';

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('leaderboard');

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-800 tracking-tight sm:text-4xl">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted">{t('subtitle')}</p>
      </header>

      <LeaderboardView />
    </div>
  );
}
