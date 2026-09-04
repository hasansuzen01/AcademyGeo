'use client';

import { motion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { type AnswerResult, type QueueCard, fetchQueue, submitAnswer } from '@/lib/api';
import { useSession } from '@/lib/auth-client';

import { Flashcard } from './flashcard';
import { SessionProgress } from './session-progress';
import { SignInPrompt } from './sign-in-prompt';

type Phase = 'loading' | 'playing' | 'empty' | 'done' | 'error';

export function PlaySession() {
  const t = useTranslations('play');
  const errors = useTranslations('errors');
  const { data: session, isPending: sessionPending } = useSession();
  const userId = session?.user?.id;

  const [phase, setPhase] = useState<Phase>('loading');
  const [cards, setCards] = useState<QueueCard[]>([]);
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [answeredAt, setAnsweredAt] = useState<number | null>(null);
  const [guessedCode, setGuessedCode] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [pending, setPending] = useState(false);
  const [score, setScore] = useState(0);

  const load = useCallback(async () => {
    setPhase('loading');
    try {
      const queue = await fetchQueue();
      setCards(queue.cards);
      setIndex(0);
      setScore(0);
      setResult(null);
      setGuessedCode(null);
      setAnsweredAt(null);
      setStartedAt(Date.now());
      setPhase(queue.cards.length === 0 ? 'empty' : 'playing');
    } catch {
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    if (!sessionPending && userId) void load();
  }, [load, sessionPending, userId]);

  async function guess(countryCode: string) {
    const card = cards[index];
    if (!card || pending || result) return;

    const answered = Date.now();
    setPending(true);
    setGuessedCode(countryCode);
    setAnsweredAt(answered);

    try {
      const answer = await submitAnswer({
        metaId: card.metaId,
        guessedCountryCode: countryCode,
        responseMs: answered - startedAt,
      });
      setResult(answer);
      if (answer.correct) setScore((current) => current + 1);
    } catch {
      setGuessedCode(null);
      setAnsweredAt(null);
      setPhase('error');
    } finally {
      setPending(false);
    }
  }

  function next() {
    if (index + 1 >= cards.length) {
      setPhase('done');
      return;
    }
    setIndex((current) => current + 1);
    setResult(null);
    setGuessedCode(null);
    setAnsweredAt(null);
    setStartedAt(Date.now());
  }

  if (sessionPending) return <Shell>{t('loading')}</Shell>;
  if (!userId) return <SignInPrompt />;
  if (phase === 'loading') return <Shell>{t('loading')}</Shell>;

  if (phase === 'error') {
    return (
      <Shell>
        <p>{errors('loadSession')}</p>
        <button type="button" onClick={() => void load()} className="btn btn-quiet mt-5">
          {errors('retry')}
        </button>
      </Shell>
    );
  }

  if (phase === 'empty') {
    return (
      <Shell>
        <h2 className="font-display text-2xl font-900 tracking-tight text-ink">
          {t('emptyTitle')}
        </h2>
        <p className="mt-2 max-w-md">{t('emptyBody')}</p>
      </Shell>
    );
  }

  if (phase === 'done') {
    const perfect = score === cards.length;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="card-raised mx-auto max-w-md px-6 py-12 text-center"
      >
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-paint/25 text-paint-deep">
          <PartyPopper className="size-8" aria-hidden />
        </span>

        <p className="mt-6 font-display text-6xl font-900 tracking-tight tabular-nums text-go">
          {score}
          <span className="text-muted">/{cards.length}</span>
        </p>
        <p className="mt-2 font-display text-lg font-900">
          {perfect ? t('summaryPerfect') : t('summaryTitle')}
        </p>
        <p className="mt-1 text-sm text-muted">
          {t('summaryScore', { correct: score, total: cards.length })}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button type="button" onClick={() => void load()} className="btn btn-go">
            {t('summaryAgain')}
          </button>
          <Link href="/dashboard" className="btn btn-quiet">
            {t('summaryDashboard')}
          </Link>
        </div>
      </motion.div>
    );
  }

  const card = cards[index];
  if (!card) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <SessionProgress done={index + (result ? 1 : 0)} total={cards.length} />
      </div>

      <Flashcard
        card={card}
        index={index}
        total={cards.length}
        startedAt={startedAt}
        answeredAt={answeredAt}
        result={result}
        guessedCode={guessedCode}
        pending={pending}
        onGuess={(code) => void guess(code)}
        onNext={next}
        isLast={index + 1 >= cards.length}
      />
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-raised mx-auto flex min-h-64 max-w-md flex-col items-center justify-center px-6 py-14 text-center text-muted">
      {children}
    </div>
  );
}
