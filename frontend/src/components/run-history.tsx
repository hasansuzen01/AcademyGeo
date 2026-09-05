'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { useSession } from '@/lib/auth-client';
import { type RunSummary, fetchRunHistory } from '@/lib/games-api';
import { formatDuration } from '@/lib/run-clock';
import { useLoad } from '@/lib/use-load';

/** The last runs, newest first, so a player can see whether they are improving. */
export function RunHistory() {
  const t = useTranslations('games');
  const format = useFormatter();
  const { data: session, isPending } = useSession();
  const [runs, setRuns] = useState<RunSummary[] | null>(null);

  const load = useCallback(async () => {
    setRuns(await fetchRunHistory().catch(() => []));
  }, []);

  useLoad(load, !isPending && Boolean(session?.user?.id));

  if (isPending || !session?.user?.id || !runs) return null;

  return (
    <section className="card-raised px-5 py-5">
      <h2 className="mb-4 font-display text-lg font-900 tracking-tight">{t('history.title')}</h2>

      {runs.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">{t('history.empty')}</p>
      ) : (
        <ul className="divide-y-2 divide-line">
          {runs.map((run) => (
            <li key={run.id} className="flex items-center gap-3 py-3">
              <span className="min-w-0 flex-1">
                <span className="block font-800 text-ink">{t(`modes.${run.mode}.name`)}</span>
                <span className="block text-xs text-muted">
                  {format.dateTime(new Date(run.finishedAt), {
                    day: 'numeric',
                    month: 'short',
                  })}
                  {' · '}
                  {t('history.line', {
                    correct: run.correct,
                    total: run.answered,
                    time: formatDuration(run.durationMs),
                  })}
                </span>
              </span>

              <span className="font-display text-lg font-900 tabular-nums text-ink">
                {run.score}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
