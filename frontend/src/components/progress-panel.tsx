'use client';

import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/cn';
import { type AchievementStanding, type Progress, fetchProgress } from '@/lib/progress-api';
import { useLoad } from '@/lib/use-load';

const TIER_TONE: Record<AchievementStanding['tier'], string> = {
  BRONZE: 'bg-paint/25 text-paint-deep',
  SILVER: 'bg-sky/20 text-sky',
  GOLD: 'bg-go/20 text-go-deep',
};

/**
 * Level and badges. Experience is the one number that only ever goes up, so
 * it sits at the top of the wall: a bad session still moves it.
 */
export function ProgressPanel() {
  const t = useTranslations('progress');
  const { data: session, isPending } = useSession();
  const [progress, setProgress] = useState<Progress | null>(null);

  const load = useCallback(async () => {
    setProgress(await fetchProgress().catch(() => null));
  }, []);

  useLoad(load, !isPending && Boolean(session?.user?.id));

  if (isPending || !session?.user?.id) return null;
  if (!progress) return <div className="card-raised h-40 animate-pulse" />;

  const earned = progress.achievements.filter((achievement) => achievement.unlocked).length;

  return (
    <div className="space-y-6">
      <section className="card-raised px-5 py-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{t('level')}</p>
            <p className="font-display text-4xl font-900 tracking-tight tabular-nums text-ink">
              {progress.level}
            </p>
          </div>

          <p className="text-right text-sm font-800 tabular-nums text-muted">
            {t('xpToNext', { xp: progress.nextLevelXp - progress.xp })}
          </p>
        </div>

        <div
          className="mt-4 h-3 overflow-hidden rounded-full bg-edge"
          role="progressbar"
          aria-valuemin={progress.levelStartXp}
          aria-valuemax={progress.nextLevelXp}
          aria-valuenow={progress.xp}
          aria-label={t('level')}
        >
          <div
            className="h-full rounded-full bg-go transition-[width] duration-500"
            style={{ width: `${Math.round(progress.progress * 100)}%` }}
          />
        </div>

        <p className="mt-2 text-xs font-800 text-muted">{t('totalXp', { xp: progress.xp })}</p>
      </section>

      <section className="card-raised px-5 py-5">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-lg font-900 tracking-tight">{t('badges')}</h2>
          <p className="text-sm font-800 text-muted">
            {t('badgeCount', { earned, total: progress.achievements.length })}
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {progress.achievements.map((achievement) => (
            <li
              key={achievement.code}
              className={cn(
                'flex items-start gap-3 rounded-2xl px-3 py-3',
                achievement.unlocked ? 'bg-canvas' : 'bg-canvas/60',
              )}
            >
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl font-display text-sm font-900',
                  achievement.unlocked ? TIER_TONE[achievement.tier] : 'bg-edge text-muted',
                )}
                aria-hidden
              >
                {achievement.unlocked ? t(`tiers.${achievement.tier}`) : <Lock className="size-4" />}
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block font-800',
                    achievement.unlocked ? 'text-ink' : 'text-muted',
                  )}
                >
                  {t(`achievements.${achievement.code}.name`)}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                  {t(`achievements.${achievement.code}.hint`)}
                </span>

                {!achievement.unlocked && (
                  <span className="mt-1.5 block text-[0.6875rem] font-800 tabular-nums text-muted">
                    {achievement.current}/{achievement.threshold}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
