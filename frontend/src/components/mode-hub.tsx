'use client';

import {
  ArrowRight,
  Brain,
  CalendarDays,
  ChevronRight,
  Crosshair,
  Heart,
  type LucideIcon,
  Swords,
  Timer,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { CollectionCover } from '@/components/collection-cover';
import { PhotoCredit } from '@/components/photo-credit';
import { Link } from '@/i18n/navigation';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/cn';
import type { Collection } from '@/lib/decks-api';
import { type DailyStatus, type PlayMode, fetchDailyStatus } from '@/lib/games-api';
import { useLoad } from '@/lib/use-load';

interface ScoredMode {
  mode: Exclude<PlayMode, 'PRACTICE'>;
  href: string;
  Icon: LucideIcon;
  /** The painted band across the top, so the modes are told apart at a glance. */
  band: string;
  /** The same colour at a weight that reads as text on white. */
  ink: string;
}

const SCORED: ScoredMode[] = [
  { mode: 'DAILY', href: '/play/daily', Icon: CalendarDays, band: 'bg-paint', ink: 'text-paint-deep' },
  { mode: 'RUSH', href: '/play/rush', Icon: Timer, band: 'bg-sky', ink: 'text-sky-deep' },
  { mode: 'SURVIVAL', href: '/play/survival', Icon: Heart, band: 'bg-stop', ink: 'text-stop-deep' },
  { mode: 'DUEL', href: '/play/duel', Icon: Swords, band: 'bg-paint-deep', ink: 'text-paint-deep' },
  { mode: 'FLASH', href: '/play/flash', Icon: Zap, band: 'bg-go-deep', ink: 'text-go-deep' },
  { mode: 'DRILL', href: '/play/drill', Icon: Crosshair, band: 'bg-ink', ink: 'text-ink' },
];

/** How many collections the hub shows before sending players to the full list. */
const COLLECTIONS_SHOWN = 3;

/**
 * The front door of the game. Practice is what most people should do most
 * days, so it gets the whole first row and a real photograph from the deck;
 * the scored modes follow as a set of painted cards, and the collections close
 * the page as pictures rather than a line of text.
 */
export function ModeHub({ collections }: { collections: Collection[] }) {
  const t = useTranslations('games');
  const play = useTranslations('play');
  const sets = useTranslations('collections');
  const locale = useLocale();
  const { data: session } = useSession();
  const [daily, setDaily] = useState<DailyStatus | null>(null);

  const load = useCallback(async () => {
    setDaily(await fetchDailyStatus().catch(() => null));
  }, []);

  useLoad(load, Boolean(session?.user?.id));

  const heroCover = collections.find((collection) => collection.cover)?.cover ?? null;
  const shown = collections.slice(0, COLLECTIONS_SHOWN);
  const nameOf = (collection: Collection) =>
    locale === 'tr' ? collection.nameTr : collection.nameEn;

  return (
    <div className="space-y-12">
      <section>
        <Link
          href="/play/practice"
          className="card-raised card-lift rise-in group grid overflow-hidden lg:grid-cols-[1fr_1.05fr]"
        >
          <span className="flex flex-col justify-center gap-4 p-6 sm:p-9">
            <span className="eyebrow text-go-deep">{t('hub.recommended')}</span>

            <span className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-go/15 text-go-deep">
                <Brain className="size-6" aria-hidden />
              </span>
              <span className="font-display text-3xl font-900 tracking-tight text-ink sm:text-4xl">
                {t('modes.PRACTICE.name')}
              </span>
            </span>

            <span className="max-w-md text-base leading-relaxed text-muted">
              {t('modes.PRACTICE.blurb')}
            </span>

            <span className="mt-1 flex flex-wrap items-center gap-3">
              <span className="btn btn-go">
                {t('hub.start')}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
              <span className="rounded-full bg-canvas px-3 py-1 text-xs font-800 text-muted">
                {t('modes.PRACTICE.rule')}
              </span>
            </span>
          </span>

          <span className="relative block min-h-60 bg-go-wash lg:min-h-80">
            {heroCover && (
              <Image
                src={heroCover.url}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            )}
            {/* The question every card asks, pinned over the road like a round in play. */}
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-line bg-paper px-3.5 py-2 font-display text-sm font-900 text-ink">
              <span className="centre-line h-1.5 w-8 rounded-full" aria-hidden />
              {play('prompt')}
            </span>
          </span>
        </Link>
        <PhotoCredit credit={heroCover?.credit ?? null} label={play('photoCredit')} className="mt-2 text-right" />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="font-display text-2xl font-900 tracking-tight text-ink">{t('hub.scoredTitle')}</h2>
          <p className="mt-1 text-sm text-muted">{t('hub.scoredBody')}</p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCORED.map(({ mode, href, Icon, band, ink }, index) => {
            const done = mode === 'DAILY' && daily?.played;

            return (
              <li key={mode}>
                <Link
                  href={href}
                  style={{ animationDelay: `${(index + 1) * 45}ms` }}
                  className="card-raised card-lift rise-in group flex h-full flex-col overflow-hidden"
                >
                  <span className={cn('relative flex h-24 items-end justify-between px-5 pb-3', band)}>
                    <Icon
                      className="absolute -top-3 right-2 size-24 text-paper opacity-20 transition-transform duration-300 group-hover:-rotate-6"
                      aria-hidden
                    />
                    <span
                      className={cn(
                        'relative flex size-12 translate-y-6 items-center justify-center rounded-2xl border-2 border-b-4 border-line bg-paper',
                        ink,
                      )}
                    >
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <span className="relative rounded-full bg-paper/95 px-2.5 py-1 text-[0.6875rem] font-800 text-ink">
                      {t(`modes.${mode}.rule`)}
                    </span>
                  </span>

                  <span className="flex flex-1 flex-col px-5 pt-8 pb-5">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-lg font-900 tracking-tight text-ink">
                        {t(`modes.${mode}.name`)}
                      </span>
                      {done && (
                        <span className="rounded-full bg-go/15 px-2.5 py-0.5 text-[0.6875rem] font-800 text-go-deep">
                          {t('daily.doneToday', { score: daily?.score ?? 0 })}
                        </span>
                      )}
                    </span>

                    <span className="mt-1.5 block text-sm leading-relaxed text-muted">
                      {t(`modes.${mode}.blurb`)}
                    </span>

                    <span className={cn('mt-auto inline-flex items-center gap-1 pt-4 text-sm font-800', ink)}>
                      {t('hub.play')}
                      <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {shown.length > 0 && (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl font-900 tracking-tight text-ink">
                {t('hub.collectionsTitle')}
              </h2>
              <p className="mt-1 text-sm text-muted">{t('hub.collectionsBody')}</p>
            </div>
            <Link
              href="/collections"
              className="inline-flex items-center gap-1 text-sm font-800 text-go-deep hover:underline"
            >
              {t('hub.allCollections')}
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((collection) => (
              <li key={collection.slug}>
                <Link
                  href={`/play/practice?deck=${collection.slug}`}
                  className="card-raised card-lift group block overflow-hidden"
                >
                  <CollectionCover
                    collection={collection}
                    name={nameOf(collection)}
                    count={sets('cardCount', { count: collection.cardCount })}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                  />
                </Link>
                <PhotoCredit
                  credit={collection.cover?.credit ?? null}
                  label={play('photoCredit')}
                  className="mt-1.5 px-1"
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
