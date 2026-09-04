'use client';

import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { type Country, type DashboardStats, fetchCountries, fetchDashboard } from '@/lib/api';
import { buildActivityWindow } from '@/lib/activity-window';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/cn';
import { useLoad } from '@/lib/use-load';

import { SignInPrompt } from './sign-in-prompt';

const ACTIVITY_DAYS = 30;

export function DashboardView() {
  const t = useTranslations('dashboard');
  const errors = useTranslations('errors');
  const { data: session, isPending: sessionPending } = useSession();
  const userId = session?.user?.id;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const [dashboard, countryList] = await Promise.all([fetchDashboard(), fetchCountries()]);
      setStats(dashboard);
      setCountries(countryList);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useLoad(load, !sessionPending && Boolean(userId));

  if (sessionPending) return null;
  if (!session?.user) return <SignInPrompt reason="progress" />;

  if (failed) {
    return (
      <div className="card-raised px-6 py-10 text-center text-muted">
        <p>{errors('loadStats')}</p>
        <button type="button" onClick={() => void load()} className="mt-4 btn btn-quiet">
          {errors('retry')}
        </button>
      </div>
    );
  }

  if (!stats) return <div className="card-raised h-64 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <WinRateTile stats={stats} />
        <Tile label={t('streak')} value={stats.streak} hint={t('streakHint')} />
        <Tile label={t('due')} value={stats.dueNow} hint={t('dueHint')} />
        <Tile
          label={t('learned')}
          value={`${stats.learnedMetas}/${stats.trackedMetas}`}
          hint={t('learnedHint')}
        />
      </div>

      <section className="card-raised px-5 py-5">
        <h2 className="font-display text-lg font-800 tracking-tight">{t('activityTitle')}</h2>
        <ActivityRoad activity={stats.activity} emptyLabel={t('activityEmpty')} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ConfusionLog stats={stats} countries={countries} />
        <CategoryBars stats={stats} />
      </div>

      <div className="flex justify-center pt-2">
        <Link href="/play" className="btn btn-go">
          {t('startCta')}
        </Link>
      </div>
    </div>
  );
}

function WinRateTile({ stats }: { stats: DashboardStats }) {
  const t = useTranslations('dashboard');

  return (
    <div className="card-raised relative overflow-hidden px-5 py-5">
      <span className="eyebrow">{t('winRate')}</span>
      <p className="mt-3 font-display text-5xl font-900 tracking-tight tabular-nums text-paint">
        {stats.winRate}
        <span className="text-2xl text-muted">%</span>
      </p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-edge">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${stats.winRate}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="centre-line h-full"
        />
      </div>
      <p className="mt-3 text-xs text-muted">
        {t('winRateHint', {
          correct: stats.correctReviews,
          total: stats.totalReviews,
        })}
      </p>
    </div>
  );
}

function Tile({ label, value, hint }: { label: string; value: number | string; hint: string }) {
  return (
    <div className="card-raised px-5 py-5">
      <span className="eyebrow">{label}</span>
      <p className="mt-3 font-display text-5xl font-900 tracking-tight tabular-nums">{value}</p>
      <p className="mt-4 text-xs text-muted">{hint}</p>
    </div>
  );
}

/** Thirty days of practice, drawn as a stretch of centre line. */
function ActivityRoad({
  activity,
  emptyLabel,
}: {
  activity: DashboardStats['activity'];
  emptyLabel: string;
}) {
  const days = buildActivityWindow(activity, ACTIVITY_DAYS);
  const busiest = Math.max(1, ...days.map((day) => day.reviews));

  return (
    <>
      <div className="mt-5 flex items-end gap-[3px]">
        {days.map((day) => (
          <div
            key={day.key}
            title={`${day.key}: ${day.reviews}`}
            className={cn(
              'flex-1 rounded-[2px] transition-colors',
              day.reviews > 0 ? 'bg-paint' : 'bg-edge',
            )}
            style={{ height: `${12 + (day.reviews / busiest) * 44}px` }}
          />
        ))}
      </div>
      {activity.length === 0 && <p className="mt-4 text-xs text-muted">{emptyLabel}</p>}
    </>
  );
}

function ConfusionLog({ stats, countries }: { stats: DashboardStats; countries: Country[] }) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const nameOf = (code: string) => {
    const country = countries.find((item) => item.code === code);
    if (!country) return code;
    return locale === 'tr' ? country.nameTr : country.nameEn;
  };

  return (
    <section className="card-raised px-5 py-5">
      <h2 className="font-display text-lg font-800 tracking-tight">{t('confusionsTitle')}</h2>
      <p className="mt-1 text-xs text-muted">{t('confusionsBody')}</p>

      {stats.confusions.length === 0 ? (
        <p className="mt-6 text-sm text-muted">{t('confusionsEmpty')}</p>
      ) : (
        <ul className="mt-5 divide-y divide-line">
          {stats.confusions.map((row) => (
            <li
              key={`${row.actual}-${row.guessed}`}
              className="flex items-center gap-3 py-3 text-sm"
            >
              <span className="font-mono text-xs text-muted">{row.actual}</span>
              <span className="truncate">{nameOf(row.actual)}</span>
              <span className="h-px flex-1 bg-edge" />
              <span className="truncate text-stop">{nameOf(row.guessed)}</span>
              <span className="font-mono text-xs text-muted">
                {t('confusionsCount', { count: row.count })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CategoryBars({ stats }: { stats: DashboardStats }) {
  const t = useTranslations('dashboard');
  const categories = useTranslations('categories');

  return (
    <section className="card-raised px-5 py-5">
      <h2 className="font-display text-lg font-800 tracking-tight">{t('categoriesTitle')}</h2>

      {stats.categories.length === 0 ? (
        <p className="mt-6 text-sm text-muted">{t('categoriesEmpty')}</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {stats.categories.map((row) => (
            <li key={row.category}>
              <div className="flex items-baseline justify-between text-sm">
                <span>{categories(row.category)}</span>
                <span className="font-mono text-xs tabular-nums text-muted">{row.winRate}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-edge">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${row.winRate}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={cn('h-full', row.winRate >= 70 ? 'bg-go' : 'bg-stop')}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
