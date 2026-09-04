'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';

import type { AnswerResult, QueueCard } from '@/lib/api';
import { cn } from '@/lib/cn';

import { RoadTimer } from './road-timer';

interface FlashcardProps {
  card: QueueCard;
  index: number;
  total: number;
  startedAt: number;
  answeredAt: number | null;
  result: AnswerResult | null;
  guessedCode: string | null;
  pending: boolean;
  onGuess: (countryCode: string) => void;
  onNext: () => void;
  isLast: boolean;
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
}: FlashcardProps) {
  const t = useTranslations('play');
  const categories = useTranslations('categories');
  const locale = useLocale();

  return (
    <div className="pb-40">
      <div className="card-raised overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b-2 border-line px-5 py-3">
          <span className="rounded-full bg-canvas px-3 py-1 text-xs font-900 text-muted">
            {categories(card.category)}
          </span>
          <RoadTimer startedAt={startedAt} frozenAt={answeredAt ?? undefined} />
        </div>

        <div className="relative aspect-[8/5] w-full bg-canvas">
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
                className="object-contain"
                priority={index === 0}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <h2 className="mt-7 mb-4 text-center font-display text-2xl font-900 tracking-tight">
        {t('prompt')}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {card.choices.map((choice) => {
          const isAnswer = result?.country.code === choice.code;
          const isGuess = guessedCode === choice.code;

          return (
            <button
              key={choice.code}
              type="button"
              disabled={pending || result !== null}
              onClick={() => onGuess(choice.code)}
              className={cn(
                'btn btn-quiet justify-start px-5 py-4 text-base text-ink',
                !result && 'hover:border-sky',
                result && isAnswer && 'border-go bg-go/15 font-900 text-go-deep',
                result && isGuess && !isAnswer && 'border-stop bg-stop/15 font-900 text-stop-deep',
                result && !isAnswer && !isGuess && 'opacity-40',
              )}
            >
              {locale === 'tr' ? choice.nameTr : choice.nameEn}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'fixed inset-x-0 bottom-0 z-30 border-t-2',
              result.correct ? 'border-go/40 bg-go/10' : 'border-stop/40 bg-stop/10',
            )}
          >
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center">
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
                <p className="mt-2 text-xs font-800 text-muted">
                  {t('nextDue', {
                    interval:
                      result.intervalDays === 0
                        ? t('intervalMinutes')
                        : t('intervalDays', { days: result.intervalDays }),
                  })}
                </p>
              </div>

              <button
                type="button"
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

      <p className="sr-only">{t('cardCounter', { current: index + 1, total })}</p>
    </div>
  );
}
