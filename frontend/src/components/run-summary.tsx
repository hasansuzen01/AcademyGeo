'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Flame, Target, Timer, Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import type { RunView } from '@/lib/games-api';
import type { ReturnPlace } from '@/lib/return-place';
import { formatDuration } from '@/lib/run-clock';

/**
 * The scoreboard at the end of a run. The score is the headline because it is
 * the number that reaches the leaderboard; accuracy, streak and time are the
 * three things a player changes to move it.
 */
export function RunSummary({
  run,
  onAgain,
  returnTo,
}: {
  run: RunView;
  onAgain: () => void;
  /** The page the run was opened from, so the player can go straight back to it. */
  returnTo: ReturnPlace;
}) {
  const t = useTranslations('games');
  const play = useTranslations('play');
  const accuracy = run.answered === 0 ? 0 : Math.round((run.correct / run.answered) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="card-raised mx-auto max-w-md px-6 py-10 text-center"
    >
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-paint/25 text-paint-deep">
        <Trophy className="size-8" aria-hidden />
      </span>

      <p className="eyebrow mt-6">{t(`modes.${run.mode}.name`)}</p>
      <p className="mt-1 font-display text-6xl font-900 tracking-tight tabular-nums text-ink">
        {run.score}
      </p>
      <p className="mt-1 text-sm font-800 text-muted">{t('summary.points')}</p>

      <dl className="mt-8 grid grid-cols-3 gap-3">
        <Stat
          icon={<Target className="size-4" aria-hidden />}
          label={t('summary.accuracy')}
          value={`${accuracy}%`}
          detail={t('summary.correctOf', { correct: run.correct, total: run.answered })}
        />
        <Stat
          icon={<Flame className="size-4" aria-hidden />}
          label={t('summary.bestStreak')}
          value={String(run.bestStreak)}
        />
        <Stat
          icon={<Timer className="size-4" aria-hidden />}
          label={t('summary.time')}
          value={formatDuration(run.durationMs)}
        />
      </dl>

      <div className="mt-8 flex flex-col gap-3">
        {run.mode === 'DAILY' ? (
          <Link href="/leaderboard" className="btn btn-go">
            {t('summary.seeBoard')}
          </Link>
        ) : (
          <button type="button" onClick={onAgain} className="btn btn-go">
            {t('summary.again')}
          </button>
        )}
        <Link href="/dashboard" className="btn btn-quiet">
          {play('summaryDashboard')}
        </Link>
        <Link href={returnTo.href} className="btn btn-quiet">
          <ArrowLeft className="size-4" aria-hidden />
          {play(`back.${returnTo.label}`)}
        </Link>
      </div>
    </motion.div>
  );
}

function Stat({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl bg-canvas px-2 py-3">
      <dt className="flex items-center justify-center gap-1.5 text-[0.6875rem] font-800 tracking-wide text-muted uppercase">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 font-display text-xl font-900 tabular-nums text-ink">{value}</dd>
      {detail && <p className="text-[0.6875rem] font-700 text-muted">{detail}</p>}
    </div>
  );
}
