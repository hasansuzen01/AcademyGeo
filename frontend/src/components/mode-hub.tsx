'use client';

import { Brain, CalendarDays, ChevronRight, Crosshair, Heart, Timer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/cn';
import { type DailyStatus, type PlayMode, fetchDailyStatus } from '@/lib/games-api';
import { useLoad } from '@/lib/use-load';

interface ModeCard {
  mode: PlayMode;
  href: string;
  icon: React.ReactNode;
  /** The stripe down the left edge, so the modes are told apart at a glance. */
  accent: string;
}

const MODES: ModeCard[] = [
  {
    mode: 'PRACTICE',
    href: '/play/practice',
    icon: <Brain className="size-6" aria-hidden />,
    accent: 'bg-go',
  },
  {
    mode: 'DAILY',
    href: '/play/daily',
    icon: <CalendarDays className="size-6" aria-hidden />,
    accent: 'bg-paint',
  },
  {
    mode: 'RUSH',
    href: '/play/rush',
    icon: <Timer className="size-6" aria-hidden />,
    accent: 'bg-sky',
  },
  {
    mode: 'SURVIVAL',
    href: '/play/survival',
    icon: <Heart className="size-6" aria-hidden />,
    accent: 'bg-stop',
  },
  {
    mode: 'DRILL',
    href: '/play/drill',
    icon: <Crosshair className="size-6" aria-hidden />,
    accent: 'bg-ink',
  },
];

/** The front door of the game: pick how you want to practise today. */
export function ModeHub() {
  const t = useTranslations('games');
  const { data: session } = useSession();
  const [daily, setDaily] = useState<DailyStatus | null>(null);

  const load = useCallback(async () => {
    setDaily(await fetchDailyStatus().catch(() => null));
  }, []);

  useLoad(load, Boolean(session?.user?.id));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {MODES.map((card, index) => {
        const done = card.mode === 'DAILY' && daily?.played;

        return (
          <Link
            key={card.mode}
            href={card.href}
            className={cn(
              'card-raised group relative flex gap-4 overflow-hidden p-5 transition-transform',
              'hover:-translate-y-0.5 focus-visible:-translate-y-0.5',
              // The first card is the one most people want, so it spans the
              // row on a wide screen instead of sharing it.
              index === 0 && 'sm:col-span-2',
            )}
          >
            <span className={cn('absolute inset-y-0 left-0 w-1.5', card.accent)} aria-hidden />

            <span className="mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-2xl bg-canvas text-ink">
              {card.icon}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg font-900 tracking-tight text-ink">
                  {t(`modes.${card.mode}.name`)}
                </span>
                <span className="rounded-full bg-canvas px-2.5 py-0.5 text-[0.6875rem] font-800 text-muted">
                  {t(`modes.${card.mode}.rule`)}
                </span>
                {done && (
                  <span className="rounded-full bg-go/15 px-2.5 py-0.5 text-[0.6875rem] font-800 text-go-deep">
                    {t('daily.doneToday', { score: daily?.score ?? 0 })}
                  </span>
                )}
              </span>

              <span className="mt-1.5 block text-sm leading-relaxed text-muted">
                {t(`modes.${card.mode}.blurb`)}
              </span>
            </span>
          </Link>
        );
      })}

      <Link
        href="/collections"
        className="card group flex items-center justify-between gap-4 p-5 sm:col-span-2"
      >
        <span>
          <span className="block font-display font-900 tracking-tight text-ink">
            {t('hub.collectionsTitle')}
          </span>
          <span className="mt-1 block text-sm text-muted">{t('hub.collectionsBody')}</span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
      </Link>
    </div>
  );
}
