'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Medal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useState } from 'react';

import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/cn';
import {
  type GlobalBoard,
  type Leaderboard,
  type LeaderboardWindow,
  SCORED_MODES,
  type ScoredMode,
  fetchGlobalRanking,
  fetchLeaderboard,
} from '@/lib/games-api';
import { useLoad } from '@/lib/use-load';

import { SignInPrompt } from './sign-in-prompt';

const WINDOWS: LeaderboardWindow[] = ['all', 'week'];
const PAGE_SIZE = 25;

/** The site-wide table sits first, because it is the one everybody is on. */
const GLOBAL = 'GLOBAL' as const;
type Board = typeof GLOBAL | ScoredMode;

/** Gold, silver, bronze. Everyone below the podium shows their number. */
const MEDAL_TONE: Record<number, string> = {
  1: 'text-paint-deep',
  2: 'text-muted',
  3: 'text-stop-deep',
};

export function LeaderboardView() {
  const t = useTranslations('leaderboard');
  const errors = useTranslations('errors');
  const { data: session, isPending } = useSession();
  const viewerId = session?.user?.id;

  const [board, setBoard] = useState<Board>(GLOBAL);
  const [window_, setWindow] = useState<LeaderboardWindow>('all');
  const [page, setPage] = useState(0);
  const [modeBoard, setModeBoard] = useState<Leaderboard | null>(null);
  const [globalBoard, setGlobalBoard] = useState<GlobalBoard | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      if (board === GLOBAL) {
        setGlobalBoard(await fetchGlobalRanking(page * PAGE_SIZE, PAGE_SIZE));
      } else {
        setModeBoard(await fetchLeaderboard(board, window_));
      }
    } catch {
      setFailed(true);
    }
  }, [board, page, window_]);

  useLoad(load, !isPending && Boolean(viewerId));

  function choose(next: Board) {
    setBoard(next);
    setPage(0);
  }

  if (isPending) return <Empty>{t('loading')}</Empty>;
  if (!viewerId) return <SignInPrompt />;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <Tab active={board === GLOBAL} onClick={() => choose(GLOBAL)}>
          {t('global')}
        </Tab>
        {SCORED_MODES.map((mode) => (
          <Tab key={mode} active={board === mode} onClick={() => choose(mode)}>
            {t(`modes.${mode}`)}
          </Tab>
        ))}
      </div>

      {board !== GLOBAL && (
        <div className="mb-5 flex gap-2">
          {WINDOWS.map((option) => (
            <Tab key={option} small active={option === window_} onClick={() => setWindow(option)}>
              {t(`windows.${option}`)}
            </Tab>
          ))}
        </div>
      )}

      {failed && (
        <Empty>
          <p>{errors('loadSession')}</p>
          <button type="button" onClick={() => void load()} className="btn btn-quiet mt-4">
            {errors('retry')}
          </button>
        </Empty>
      )}

      {!failed && board === GLOBAL && globalBoard && (
        <GlobalTable
          board={globalBoard}
          viewerId={viewerId}
          page={page}
          onPage={setPage}
          pageSize={PAGE_SIZE}
        />
      )}

      {!failed && board !== GLOBAL && modeBoard && (
        <ModeTable board={modeBoard} viewerId={viewerId} />
      )}
    </div>
  );
}

/** Everyone on the site, ranked on experience, a page at a time. */
function GlobalTable({
  board,
  viewerId,
  page,
  onPage,
  pageSize,
}: {
  board: GlobalBoard;
  viewerId: string;
  page: number;
  onPage: (page: number) => void;
  pageSize: number;
}) {
  const t = useTranslations('leaderboard');
  const lastPage = Math.max(0, Math.ceil(board.total / pageSize) - 1);
  const podium = page === 0 ? board.entries.slice(0, 3) : [];
  const rest = page === 0 ? board.entries.slice(3) : board.entries;

  if (board.entries.length === 0) return <Empty>{t('empty')}</Empty>;

  return (
    <div>
      {podium.length > 0 && (
        <ol className="mb-4 grid gap-3 sm:grid-cols-3">
          {podium.map((entry, place) => (
            <motion.li
              key={entry.userId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: place * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'card-raised flex flex-col items-center gap-2 px-4 py-5 text-center',
                // The winner sits a little higher than the other two.
                place === 0 && 'sm:-translate-y-2',
                entry.userId === viewerId && 'ring-2 ring-paint',
              )}
            >
              <Medal className={cn('size-7', MEDAL_TONE[entry.rank])} aria-hidden />
              <Portrait name={entry.name} image={entry.image} size={48} />
              <span className="w-full truncate font-display font-900 text-ink">{entry.name}</span>
              <span className="text-xs font-800 text-muted">
                {t('levelAndXp', { level: entry.level, xp: entry.xp })}
              </span>
            </motion.li>
          ))}
        </ol>
      )}

      {rest.length > 0 && (
        <ol className="card-raised divide-y-2 divide-line overflow-hidden">
          {rest.map((entry) => (
            <BoardRow
              key={entry.userId}
              entry={entry}
              mine={entry.userId === viewerId}
              subtitle={t('level', { level: entry.level })}
              figure={entry.xp}
            />
          ))}
        </ol>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm font-800 text-muted">
          {board.you
            ? t('yourRank', { rank: board.you.rank, total: board.total })
            : t('playerCount', { total: board.total })}
        </p>

        <div className="flex gap-2">
          <PageButton disabled={page === 0} onClick={() => onPage(page - 1)}>
            <ChevronLeft className="size-4" aria-hidden />
            {t('previous')}
          </PageButton>
          <PageButton disabled={page >= lastPage} onClick={() => onPage(page + 1)}>
            {t('next')}
            <ChevronRight className="size-4" aria-hidden />
          </PageButton>
        </div>
      </div>
    </div>
  );
}

/** One mode, one row per player, their best run in it. */
function ModeTable({ board, viewerId }: { board: Leaderboard; viewerId: string }) {
  const t = useTranslations('leaderboard');

  if (board.entries.length === 0) return <Empty>{t('empty')}</Empty>;

  return (
    <div>
      <ol className="card-raised divide-y-2 divide-line overflow-hidden">
        {board.entries.map((entry) => (
          <BoardRow
            key={entry.userId}
            entry={entry}
            mine={entry.userId === viewerId}
            subtitle={t('correctOf', { correct: entry.correct, total: entry.answered })}
            figure={entry.score}
          />
        ))}
      </ol>

      {board.you && (
        <p className="mt-4 text-center text-sm font-800 text-muted">
          {t('yourStanding', { rank: board.you.rank, score: board.you.score })}
        </p>
      )}
    </div>
  );
}

/** A line on either table: place, face, name, one detail, one number. */
function BoardRow({
  entry,
  mine,
  subtitle,
  figure,
}: {
  entry: { rank: number; userId: string; name: string; image: string | null };
  mine: boolean;
  subtitle: string;
  figure: number;
}) {
  return (
    <li className={cn('flex items-center gap-3 px-4 py-3', mine && 'bg-paint/12')}>
      <Rank rank={entry.rank} />
      <Portrait name={entry.name} image={entry.image} size={36} />

      <span className="min-w-0 flex-1">
        <span className="block truncate font-800 text-ink">{entry.name}</span>
        <span className="block text-xs text-muted">{subtitle}</span>
      </span>

      <span className="font-display text-lg font-900 tabular-nums text-ink">{figure}</span>
    </li>
  );
}

function Portrait({
  name,
  image,
  size,
}: {
  name: string;
  image: string | null;
  size: number;
}) {
  if (image) {
    return (
      <Image
        src={image}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full border-2 border-line object-cover"
        unoptimized
      />
    );
  }

  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-canvas font-display font-900 text-muted"
      aria-hidden
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
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

function PageButton({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="btn btn-quiet gap-1 px-3 py-1.5 text-xs"
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
