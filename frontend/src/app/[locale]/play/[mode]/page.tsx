import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { GameRunner } from '@/components/game-runner';
import { SCORED_MODES, type ScoredMode } from '@/lib/games-api';

/** /play/rush and friends. The URL is lower case; the API mode is not. */
const BY_SLUG: Record<string, ScoredMode> = Object.fromEntries(
  SCORED_MODES.map((mode) => [mode.toLowerCase(), mode]),
);

export function generateStaticParams() {
  return SCORED_MODES.map((mode) => ({ mode: mode.toLowerCase() }));
}

export default async function ModePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; mode: string }>;
  searchParams: Promise<{ deck?: string }>;
}) {
  const [{ locale, mode }, { deck }] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const scoredMode = BY_SLUG[mode.toLowerCase()];
  if (!scoredMode) notFound();

  const t = await getTranslations('games');

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <header className="mx-auto mb-8 max-w-2xl text-center">
        <h1 className="font-display text-3xl font-800 tracking-tight">
          {t(`modes.${scoredMode}.name`)}
        </h1>
        <p className="mt-2 text-sm text-muted">{t(`modes.${scoredMode}.blurb`)}</p>
      </header>

      <GameRunner mode={scoredMode} deckSlug={deck} />
    </div>
  );
}
