'use client';

import { Medal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useState } from 'react';

import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/cn';
import {
  type Leaderboard,
  type LeaderboardWindow,
  SCORED_MODES,
  type ScoredMode,
  fetchLeaderboard,
} from '@/lib/games-api';
import { useLoad } from '@/lib/use-load';

import { SignInPrompt } from './sign-in-prompt';

const WINDOWS: LeaderboardWindow[] = ['all', 'week'];

/** Gold, silver, bronze. Everyone below the podium shows their number. */
const MEDAL_TONE: Record<number, string> = {
  1: 'text-paint-deep',
  2: 'text-muted',
  3: 'text-stop-deep',
};

/** One row per player, their best run in the mode. */
export function LeaderboardView() {
  const t = useTranslations('leaderboard');
  const errors = useTranslations('errors');
  const { data: session, isPending } = useSession();

  const [mode, setMode] = useState<ScoredMode>('DAILY');
  const [window, setWindow] = useState<LeaderboardWindow>('all');
  const [board, setBoard] = useState<Leaderboard | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      setBoard(await fetchLeaderboard(mode, window));
    } catch {
      setFailed(true);
    }
  }, [mode, window]);

  useLoad(load, !isPending && Boolean(session?.user?.id));

  if (isPending) return <Empty>{t('loading')}</Empty>;
  if (!session?.user?.id) return <SignInPrompt />;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {SCORED_MODES.map((option) => (
          <Tab key={option} active={option === mode} onClick={() => setMode(option)}>
            {t(`modes.${option}`)}
          </Tab>
        ))}
      </div>

      <div className="mb-5 flex gap-2">
        {WINDOWS.map((option) => (
          <Tab key={option} small active={option === window} onClick={() => setWindow(option)}>
            {t(`windows.${option}`)}
          </Tab>
        ))}
      </div>

      {failed && (
        <Empty>
          <p>{errors('loadSession')}</p>
          <button type="button" onClick={() => void load()} className="btn btn-quiet mt-4">
            {errors('retry')}
          </button>
        </Empty>
      )}

      {!failed && board && board.entries.length === 0 && <Empty>{t('empty')}</Empty>}

      {!failed && board && board.entries.length > 0 && (
        <ol className="card-raised divide-y-2 divide-line overflow-hidden">
          {board.entries.map((entry) => (
            <li
              key={entry.userId}
              className={cn(
                'flex items-center gap-3 px-4 py-3',
                entry.userId === session.user.id && 'bg-paint/12',
              )}
            >
              <Rank rank={entry.rank} />

              {entry.image ? (
                <Image
                  src={entry.image}
                  alt=""
                  width={36}
                  height={36}
                  className="size-9 shrink-0 rounded-full border-2 border-line object-cover"
                  unoptimized
                />
              ) : (
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-canvas font-display text-sm font-900 text-muted"
                  aria-hidden
                >
                  {entry.name.slice(0, 1).toUpperCase()}
                </span>
              )}

              <span className="min-w-0 flex-1">
                <span className="block truncate font-800 text-ink">{entry.name}</span>
                <span className="block text-xs text-muted">
                  {t('correctOf', { correct: entry.correct, total: entry.answered })}
                </span>
              </span>

              <span className="font-display text-lg font-900 tabular-nums text-ink">
                {entry.score}
              </span>
            </li>
          ))}
        </ol>
      )}

      {!failed && board?.you && (
        <p className="mt-4 text-center text-sm font-800 text-muted">
          {t('yourStanding', { rank: board.you.rank, score: board.you.score })}
        </p>
      )}
    </div>
  );
}

/** The top three carry a medal; everyone else carries their number. */
function Rank({ rank }: { rank: number }) {
  const medal = MEDAL_TONE[rank];

  return (
    <span className="flex w-8 shrink-0 justify-center">
      {medal ? (
        <Medal className={cn('size-6', medal)} aria-label={String(rank)} />
      ) : (
        <span className="font-display text-sm font-900 tabular-nums text-muted">{rank}</span>
      )}
    </span>
  );
}

function Tab({
  active,
  small,
  onClick,
  children,
}: {
  active: boolean;
  small?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-xl font-800 transition-colors',
        small ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
        active ? 'bg-ink text-paper' : 'bg-paper text-muted hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-raised flex min-h-48 flex-col items-center justify-center px-6 py-12 text-center text-muted">
      {children}
    </div>
  );
}
