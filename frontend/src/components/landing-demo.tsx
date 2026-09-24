'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { PhotoCredit } from '@/components/photo-credit';
import { cn } from '@/lib/cn';
import type { DemoCard } from '@/lib/server-api';

/** How long the answer stays up before the next card slides in. */
const REVEAL_MS = 2400;

/**
 * A real card from the deck, playable right on the landing page. The frame
 * never changes size between cards: the photo sits in a fixed box, the
 * buttons keep one line, and the reveal line has its room reserved.
 */
export function LandingDemo({ cards }: { cards: DemoCard[] }) {
  const t = useTranslations('landing');
  const play = useTranslations('play');
  const locale = useLocale();
  const [cardIndex, setCardIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    if (!picked) return;
    const timer = window.setTimeout(() => {
      setPicked(null);
      setCardIndex((current) => (current + 1) % cards.length);
    }, REVEAL_MS);

    return () => window.clearTimeout(timer);
  }, [picked, cards.length]);

  if (cards.length === 0) return null;

  // A refreshed page can hand in a shorter list than the one being cycled.
  const shown = cardIndex % cards.length;
  const card = cards[shown];
  const correct = picked === card.answer;

  return (
    <div className="card-raised w-full max-w-sm overflow-hidden">
      <div className="flex items-center justify-between border-b-2 border-line px-4 py-3">
        <span className="eyebrow">{t('demoLabel')}</span>
        <span className="flex gap-1.5" aria-hidden>
          {cards.map((item, position) => (
            <span
              key={item.id}
              className={cn('size-2 rounded-full', position === shown ? 'bg-paint' : 'bg-edge')}
            />
          ))}
        </span>
      </div>

      <div className="relative aspect-[8/5] overflow-hidden bg-canvas">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={card.imageUrl}
              alt=""
              fill
              sizes="384px"
              className="object-contain"
              priority={shown === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="space-y-3 px-4 py-4">
        <div className="grid grid-cols-2 gap-2">
          {card.choices.map((choice) => {
            const isAnswer = choice.code === card.answer;
            return (
              <button
                key={choice.code}
                type="button"
                onClick={() => setPicked((current) => current ?? choice.code)}
                className={cn(
                  'btn btn-quiet min-w-0 px-3 py-2.5 text-sm text-ink',
                  !picked && 'hover:border-sky',
                  picked && isAnswer && 'border-go bg-go/10 text-go-deep',
                  picked === choice.code && !isAnswer && 'border-stop bg-stop/10 text-stop-deep',
                )}
              >
                <span className="truncate">{locale === 'tr' ? choice.nameTr : choice.nameEn}</span>
              </button>
            );
          })}
        </div>

        <div className="flex h-16 items-start gap-2 text-sm" aria-live="polite">
          {picked ? (
            <>
              <span
                className={cn(
                  'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white',
                  correct ? 'bg-go' : 'bg-stop',
                )}
                aria-hidden
              >
                {correct ? <Check className="size-3" /> : <X className="size-3" />}
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 text-muted">
                  {locale === 'tr' ? card.titleTr : card.titleEn}
                </span>
                <PhotoCredit
                  credit={card.credit}
                  label={play('photoCredit')}
                  className="mt-0.5 truncate"
                />
              </span>
            </>
          ) : (
            <span className="text-muted">{t('demoHint')}</span>
          )}
        </div>
      </div>
    </div>
  );
}
