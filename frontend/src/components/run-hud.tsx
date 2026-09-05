'use client';

import { motion } from 'framer-motion';
import { Flame, Heart, Timer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';
import type { RunView } from '@/lib/games-api';
import { formatClock, remainingMs } from '@/lib/run-clock';

/** Under this the clock turns red, because the run is nearly gone. */
const URGENT_MS = 10_000;
/** From here the streak counter lights up, because it is now worth protecting. */
const HOT_STREAK = 3;

/**
 * The scoreboard that sits over a scored run. It shows only what that mode
 * actually has: no lives on a timed run, no clock on a fixed hand.
 */
export function RunHud({ run }: { run: RunView }) {
  const t = useTranslations('games');

  return (
    <div className="card-raised mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-3.5">
      <div>
        <p className="eyebrow">{t('hud.score')}</p>
        <p className="font-display text-2xl font-900 tabular-nums text-ink">{run.score}</p>
      </div>

      <div className="h-9 w-px bg-line" aria-hidden />

      <div>
        <p className="eyebrow">{t('hud.streak')}</p>
        <p
          className={cn(
            'flex items-center gap-1.5 font-display text-lg font-900 tabular-nums',
            run.streak >= HOT_STREAK ? 'text-paint-deep' : 'text-muted',
          )}
        >
          <Flame className="size-4" aria-hidden />
          {run.streak}
        </p>
      </div>

      {run.livesLeft !== null && <Lives left={run.livesLeft} label={t('hud.lives')} />}

      {run.endsAt && <Countdown endsAt={run.endsAt} />}

      {run.total !== null && (
        <div className="ml-auto text-right">
          <p className="eyebrow">{t('hud.card')}</p>
          <p className="font-display text-sm font-900 tabular-nums text-muted">
            {Math.min(run.answered + 1, run.total)}/{run.total}
          </p>
        </div>
      )}
    </div>
  );
}

function Lives({ left, label }: { left: number; label: string }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="flex items-center gap-1" aria-label={`${label}: ${left}`}>
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            animate={{ scale: index < left ? 1 : 0.8, opacity: index < left ? 1 : 0.25 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          >
            <Heart
              className={cn('size-5', index < left ? 'fill-stop text-stop' : 'text-edge')}
              aria-hidden
            />
          </motion.span>
        ))}
      </p>
    </div>
  );
}

/** Counts down on its own so the rest of the run does not re-render with it. */
function Countdown({ endsAt }: { endsAt: string }) {
  const t = useTranslations('games');
  const [left, setLeft] = useState(() => remainingMs(endsAt, Date.now()) ?? 0);

  useEffect(() => {
    const id = window.setInterval(() => setLeft(remainingMs(endsAt, Date.now()) ?? 0), 200);
    return () => window.clearInterval(id);
  }, [endsAt]);

  const urgent = left <= URGENT_MS;

  return (
    <div>
      <p className="eyebrow">{t('hud.time')}</p>
      <motion.p
        animate={urgent ? { scale: [1, 1.07, 1] } : { scale: 1 }}
        transition={urgent ? { duration: 1, repeat: Infinity } : { duration: 0.2 }}
        className={cn(
          'flex items-center gap-1.5 font-display text-lg font-900 tabular-nums',
          urgent ? 'text-stop' : 'text-ink',
        )}
      >
        <Timer className="size-4" aria-hidden />
        {formatClock(left)}
      </motion.p>
    </div>
  );
}
