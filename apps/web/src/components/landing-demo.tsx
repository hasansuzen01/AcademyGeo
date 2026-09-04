'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

import { cn } from '@/lib/cn';

interface DemoCard {
  image: string;
  answer: string;
  choices: Array<{ code: string; en: string; tr: string }>;
  titleEn: string;
  titleTr: string;
}

const DEMO_CARDS: DemoCard[] = [
  {
    image: '/metas/no-bollard.svg',
    answer: 'NO',
    choices: [
      { code: 'NO', en: 'Norway', tr: 'Norveç' },
      { code: 'SE', en: 'Sweden', tr: 'İsveç' },
      { code: 'FI', en: 'Finland', tr: 'Finlandiya' },
      { code: 'PL', en: 'Poland', tr: 'Polonya' },
    ],
    titleEn: 'Squared head, orange reflector.',
    titleTr: 'Düz kesilmiş baş, turuncu reflektör.',
  },
  {
    image: '/metas/za-road.svg',
    answer: 'ZA',
    choices: [
      { code: 'ZA', en: 'South Africa', tr: 'Güney Afrika' },
      { code: 'KE', en: 'Kenya', tr: 'Kenya' },
      { code: 'AU', en: 'Australia', tr: 'Avustralya' },
      { code: 'NG', en: 'Nigeria', tr: 'Nijerya' },
    ],
    titleEn: 'Yellow at the edges, white down the middle.',
    titleTr: 'Kenarlar sarı, orta çizgi beyaz.',
  },
  {
    image: '/metas/br-plate.svg',
    answer: 'BR',
    choices: [
      { code: 'BR', en: 'Brazil', tr: 'Brezilya' },
      { code: 'AR', en: 'Argentina', tr: 'Arjantin' },
      { code: 'CL', en: 'Chile', tr: 'Şili' },
      { code: 'MX', en: 'Mexico', tr: 'Meksika' },
    ],
    titleEn: 'Mercosul strip across the whole top edge.',
    titleTr: 'Üst kenar boyunca uzanan Mercosul şeridi.',
  },
];

export function LandingDemo() {
  const t = useTranslations('landing');
  const locale = useLocale();
  const [cardIndex, setCardIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const card = DEMO_CARDS[cardIndex];
  const correct = picked === card.answer;

  function pick(code: string) {
    if (picked) return;
    setPicked(code);
    window.setTimeout(() => {
      setPicked(null);
      setCardIndex((current) => (current + 1) % DEMO_CARDS.length);
    }, 2400);
  }

  return (
    <div className="card-raised w-full max-w-sm overflow-hidden">
      <div className="flex items-center justify-between border-b-2 border-line px-4 py-3">
        <span className="eyebrow">{t('demoLabel')}</span>
        <span className="flex gap-1.5" aria-hidden>
          {DEMO_CARDS.map((item, position) => (
            <span
              key={item.image}
              className={cn('size-2 rounded-full', position === cardIndex ? 'bg-paint' : 'bg-edge')}
            />
          ))}
        </span>
      </div>

      <div className="relative aspect-[8/5] bg-canvas">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={card.image}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image src={card.image} alt="" fill sizes="384px" className="object-contain" priority />
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
                onClick={() => pick(choice.code)}
                className={cn(
                  'btn btn-quiet px-3 py-2.5 text-sm text-ink',
                  !picked && 'hover:border-sky',
                  picked && isAnswer && 'border-go bg-go/10 text-go-deep',
                  picked === choice.code && !isAnswer && 'border-stop bg-stop/10 text-stop-deep',
                )}
              >
                {locale === 'tr' ? choice.tr : choice.en}
              </button>
            );
          })}
        </div>

        <div className="flex min-h-10 items-start gap-2 text-sm">
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
              <span className="text-muted">{locale === 'tr' ? card.titleTr : card.titleEn}</span>
            </>
          ) : (
            <span className="text-muted">{t('demoHint')}</span>
          )}
        </div>
      </div>
    </div>
  );
}
