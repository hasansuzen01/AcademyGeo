'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, EyeOff, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import type { QueueCard } from '@/lib/api';
import { imageFitClass } from '@/lib/card-image';
import { choiceForKey } from '@/lib/choice-keys';
import { cn } from '@/lib/cn';
import { playEffect } from '@/lib/sound';
import { useElementHeight } from '@/lib/use-element-height';
import { Link } from '@/i18n/navigation';

import { RoadTimer } from './road-timer';

/** Two answers means a duel, which is laid out as a stand-off rather than a list. */
const DUEL_CHOICES = 2;

/** What every mode knows about an answer once it has been graded. */
export interface CardResult {
  correct: boolean;
  country: { code: string; nameEn: string; nameTr: string };
  explanation: {
    titleEn: string;
    titleTr: string;
    descriptionEn: string;
    descriptionTr: string;
  };
}

interface FlashcardProps {
  card: QueueCard;
  index: number;
  total: number;
  startedAt: number;
  answeredAt: number | null;
  result: CardResult | null;
  guessedCode: string | null;
  pending: boolean;
  onGuess: (countryCode: string) => void;
  onNext: () => void;
  isLast: boolean;
  /** The one line each mode adds under the explanation: when the card comes
   *  back in practice, what the answer scored in a run. */
  footnote?: React.ReactNode;
  /** Hidden while the clock, not the deck, decides when the run ends. */
  showCounter?: boolean;
}

export function Flashcard({
  card,
  index,
  total,
  startedAt,
  answeredAt,
  result,
  guessedCode,
  pending,
  onGuess,
  onNext,
  isLast,
  footnote,
  showCounter = true,
}: FlashcardProps) {
  const t = useTranslations('play');
  const categories = useTranslations('categories');
  const locale = useLocale();

  // The answer bar is pinned to the bottom, so the page reserves exactly its
  // height. A long explanation makes it taller than any fixed guess.
  const [barRef, barHeight] = useElementHeight<HTMLDivElement>();

  const answered = result !== null;
  const covered = useCover(card.metaId, card.revealMs, answered);
  const isDuel = card.choices.length === DUEL_CHOICES;
  const name = (choice: QueueCard['choices'][number]) =>
    locale === 'tr' ? choice.nameTr : choice.nameEn;

  // Focus moves to Next when the answer lands: the button that was just
  // pressed is now disabled, so a keyboard player would otherwise be stranded
  // on a dead control every card.
  const nextRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (answered) nextRef.current?.focus();
  }, [answered]);

  // Joined rather than passed as an array: a fresh array every render would
  // tear the listener down and put it back on every render.
  useChoiceKeys({
    codes: card.choices.map((choice) => choice.code).join(','),
    disabled: pending || answered,
    onGuess,
  });

  return (
    <div style={{ paddingBottom: barHeight + 24 }}>
      <div className="lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="card-raised overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b-2 border-line px-5 py-3">
            <span className="rounded-full bg-canvas px-3 py-1 text-xs font-900 text-muted">
              {categories(card.category)}
            </span>
            <RoadTimer startedAt={startedAt} frozenAt={answeredAt ?? undefined} />
          </div>

          <div className="relative aspect-[8/5] w-full overflow-hidden bg-canvas">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={card.metaId}
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={card.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 640px"
                  className={imageFitClass(card.imageSource)}
                  priority={index === 0}
                />
              </motion.div>
            </AnimatePresence>

            {card.revealMs !== null && !covered && !result && (
              <RevealBar key={card.metaId} revealMs={card.revealMs} />
            )}

            <AnimatePresence>
              {covered && (
                <motion.div
                  initial={{ y: '-100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '-100%' }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink text-paper"
                >
                  <EyeOff className="size-8" aria-hidden />
                  <p className="font-display text-sm font-900">{t('coveredTitle')}</p>
                  <p className="text-xs opacity-70">{t('coveredBody')}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <h2 className="mt-7 mb-4 text-center font-display text-2xl font-900 tracking-tight lg:mt-0">
            {t('prompt')}
          </h2>

          {isDuel ? (
            <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
              {card.choices.map((choice, side) => (
                <motion.button
                  key={`${card.metaId}-${choice.code}`}
                  type="button"
                  initial={{ opacity: 0, x: side === 0 ? -40 : 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: side * 0.06 }}
                  disabled={pending || answered}
                  onClick={() => onGuess(choice.code)}
                  className={cn(
                    'btn btn-quiet min-h-28 flex-col justify-center px-5 py-6 text-center',
                    'font-display text-xl font-900 text-ink',
                    !result && 'hover:bg-canvas',
                    choiceTone(result, choice.code, guessedCode),
                  )}
                >
                  {name(choice)}
                </motion.button>
              ))}

              <span
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-line bg-paper px-3 py-1 font-display text-xs font-900 text-muted sm:block"
              >
                {t('versus')}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {card.choices.map((choice, position) => (
                <button
                  key={choice.code}
                  type="button"
                  disabled={pending || answered}
                  onClick={() => onGuess(choice.code)}
                  className={cn(
                    'btn btn-quiet justify-start px-5 py-4 text-base text-ink',
                    choiceTone(result, choice.code, guessedCode),
                  )}
                >
                  {/* The number is the shortcut. Showing it is the only way
                      anyone finds out the keyboard works. */}
                  <span
                    aria-hidden
                    className="mr-1 hidden size-6 shrink-0 items-center justify-center rounded-lg bg-canvas font-mono text-xs font-900 text-muted sm:inline-flex"
                  >
                    {position + 1}
                  </span>
                  {name(choice)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            ref={barRef}
            // The verdict and the explanation are the whole lesson, so they
            // are announced rather than only drawn.
            role="status"
            aria-live="polite"
            className={cn(
              'fixed inset-x-0 bottom-0 z-30 border-t-2 shadow-[0_-8px_24px_rgba(23,40,45,0.08)]',
              result.correct ? 'border-go bg-go-wash' : 'border-stop bg-stop-wash',
            )}
          >
            <div className="page-shell flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center">
              <span
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-full',
                  result.correct ? 'bg-go text-white' : 'bg-stop text-white',
                )}
                aria-hidden
              >
                {result.correct ? <Check className="size-6" /> : <X className="size-6" />}
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'font-display text-lg font-900',
                    result.correct ? 'text-go-deep' : 'text-stop-deep',
                  )}
                >
                  {result.correct
                    ? t('correct')
                    : t('answerWas', {
                        country: locale === 'tr' ? result.country.nameTr : result.country.nameEn,
                      })}
                </p>
                <p className="mt-0.5 text-sm font-600 text-ink">
                  {locale === 'tr' ? result.explanation.titleTr : result.explanation.titleEn}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {locale === 'tr'
                    ? result.explanation.descriptionTr
                    : result.explanation.descriptionEn}
                </p>
                {footnote && <div className="mt-2 text-xs font-800 text-muted">{footnote}</div>}

                {/* Two sentences is where the lesson used to stop. This is
                    the moment a player will actually go and read more. */}
                <Link
                  href={`/atlas/${result.country.code.toLowerCase()}`}
                  className="mt-2 inline-block text-xs font-900 text-go-deep underline underline-offset-4"
                >
                  {t('readMore', {
                    country: locale === 'tr' ? result.country.nameTr : result.country.nameEn,
                  })}
                </Link>
              </div>

              <button
                type="button"
                ref={nextRef}
                onClick={onNext}
                className={cn(
                  'btn w-full shrink-0 sm:w-auto',
                  result.correct ? 'btn-go' : 'btn-stop',
                )}
              >
                {isLast ? t('finish') : t('next')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showCounter && <p className="sr-only">{t('cardCounter', { current: index + 1, total })}</p>}
    </div>
  );
}

/**
 * The keyboard: 1-9 pick an answer.
 *
 * The buttons are numbered on screen, so the numbers are what a player reaches
 * for. Anything typed into a field is left alone, and a modifier means the
 * press belongs to the browser rather than to the game.
 *
 * Moving on is deliberately not handled here. Focus is already on the Next
 * button by then, so Enter and Space are its own to answer; taking them here
 * as well advanced the run twice and skipped a card.
 */
function useChoiceKeys({
  codes,
  disabled,
  onGuess,
}: {
  codes: string;
  disabled: boolean;
  onGuess: (code: string) => void;
}) {
  useEffect(() => {
    if (disabled) return;

    const choices = codes.split(',');

    function handle(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select')) {
        return;
      }

      const picked = choiceForKey(event.key, choices.length);
      if (picked === null) return;

      event.preventDefault();
      onGuess(choices[picked]);
    }

    window.addEventListener('keydown', handle);

    return () => window.removeEventListener('keydown', handle);
  }, [codes, disabled, onGuess]);
}

/**
 * How an answer button reads once the answer is in: the right one turns green,
 * the one that was picked instead turns red, and the rest step back.
 */
function choiceTone(result: CardResult | null, code: string, guessedCode: string | null): string {
  if (!result) return 'hover:border-sky';
  if (result.country.code === code) return 'border-go bg-go/15 font-900 text-go-deep';
  if (guessedCode === code) return 'border-stop bg-stop/15 font-900 text-stop-deep';

  return 'opacity-40';
}

/**
 * Whether the picture has been taken away.
 *
 * It comes back once the answer is in, because the point of covering it was to
 * make the player commit, not to stop them learning from what they missed.
 */
function useCover(cardKey: string, revealMs: number | null, answered: boolean): boolean {
  // Which card the cover belongs to, rather than a plain boolean: a new card
  // is uncovered because its key does not match, with nothing to reset.
  const [coveredCard, setCoveredCard] = useState<string | null>(null);

  useEffect(() => {
    if (revealMs === null) return;

    const id = window.setTimeout(() => {
      playEffect('cover');
      setCoveredCard(cardKey);
    }, revealMs);
    return () => window.clearTimeout(id);
  }, [cardKey, revealMs]);

  return coveredCard === cardKey && !answered;
}

/** The strip across the picture that runs out as the look runs out. */
function RevealBar({ revealMs }: { revealMs: number }) {
  return (
    <div className="absolute inset-x-0 top-0 h-1.5 bg-ink/15">
      <motion.div
        className="h-full bg-paint"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: revealMs / 1000, ease: 'linear' }}
      />
    </div>
  );
}
