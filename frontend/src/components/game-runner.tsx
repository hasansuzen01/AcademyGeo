'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { useSession } from '@/lib/auth-client';
import type { ReturnPlace } from '@/lib/return-place';
import {
  type GradedAnswer,
  type RunView,
  type ScoredMode,
  answerRun,
  fetchActiveRun,
  startRun,
} from '@/lib/games-api';
import { playEffect } from '@/lib/sound';
import { useLoad } from '@/lib/use-load';

import { Flashcard } from './flashcard';
import { RunHud } from './run-hud';
import { RunSummary } from './run-summary';
import { SignInPrompt } from './sign-in-prompt';

type Phase = 'loading' | 'playing' | 'done' | 'error';

/**
 * One loop for every scored mode. The server deals each card and holds the
 * score, so the client only asks what is next and shows what came back; the
 * differences between rush, survival, the daily and the drill live entirely
 * in the rules the server applies.
 */
export function GameRunner({
  mode,
  deckSlug,
  returnTo,
}: {
  mode: ScoredMode;
  deckSlug?: string;
  returnTo: ReturnPlace;
}) {
  const t = useTranslations('games');
  const errors = useTranslations('errors');
  const { data: session, isPending: sessionPending } = useSession();
  const userId = session?.user?.id;

  const [phase, setPhase] = useState<Phase>('loading');
  const [run, setRun] = useState<RunView | null>(null);
  const [answer, setAnswer] = useState<GradedAnswer | null>(null);
  const [lastCard, setLastCard] = useState(false);
  const [guessedCode, setGuessedCode] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [answeredAt, setAnsweredAt] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const begin = useCallback(async () => {
    try {
      // A run left open in another tab is picked back up rather than thrown
      // away, so a refresh mid-run does not cost the score.
      const active = await fetchActiveRun();
      const matches =
        active && !active.finished && active.mode === mode && active.deckSlug === (deckSlug ?? null);
      const resumed = matches ? active : await startRun({ mode, deckSlug });

      setRun(resumed);
      setAnswer(null);
      setGuessedCode(null);
      setAnsweredAt(null);
      setLastCard(false);
      setStartedAt(Date.now());
      setPhase(resumed.finished ? 'done' : 'playing');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : null);
      setPhase('error');
    }
  }, [mode, deckSlug]);

  useLoad(begin, !sessionPending && Boolean(userId));

  function restart() {
    setPhase('loading');
    setMessage(null);
    void begin();
  }

  async function guess(countryCode: string) {
    if (!run?.card || pending || answer) return;

    const answered = Date.now();
    setPending(true);
    setGuessedCode(countryCode);
    setAnsweredAt(answered);

    try {
      const graded = await answerRun({
        runId: run.runId,
        guessedCountryCode: countryCode,
        responseMs: answered - startedAt,
      });

      setRun(graded.run);

      // The clock can stop between the click and the request landing. There is
      // nothing to show for that answer, so the run just ends.
      if (!graded.graded) {
        playEffect('finish');
        setPhase('done');
        return;
      }

      playEffect(soundFor(graded.graded.correct, graded.run.streak));
      setAnswer(graded.graded);
      setLastCard(graded.finished);
    } catch {
      setGuessedCode(null);
      setAnsweredAt(null);
      setPhase('error');
    } finally {
      setPending(false);
    }
  }

  function next() {
    if (!run || run.finished) {
      playEffect('finish');
      setPhase('done');
      return;
    }

    setAnswer(null);
    setGuessedCode(null);
    setAnsweredAt(null);
    setStartedAt(Date.now());
  }

  /** The clock ran out with no answer on screen: bank the run and show it. */
  const timeUp = useCallback(async () => {
    playEffect('finish');
    const finished = await fetchActiveRun().catch(() => null);
    setRun((current) => finished ?? current);
    setPhase('done');
  }, []);

  if (sessionPending || phase === 'loading') return <Shell>{t('loading')}</Shell>;
  if (!userId) return <SignInPrompt />;

  if (phase === 'error') {
    return (
      <Shell>
        <p>{message ?? errors('loadSession')}</p>
        <button type="button" onClick={restart} className="btn btn-quiet mt-5">
          {errors('retry')}
        </button>
      </Shell>
    );
  }

  if (phase === 'done' || !run?.card) {
    return run ? (
      <RunSummary run={run} onAgain={restart} returnTo={returnTo} />
    ) : (
      <Shell>{t('loading')}</Shell>
    );
  }

  return (
    <div>
      <RunHud run={run} />

      {run.endsAt && <TimeGuard endsAt={run.endsAt} onExpired={timeUp} />}

      <Flashcard
        card={run.card}
        index={run.answered}
        total={run.total ?? run.answered + 1}
        startedAt={startedAt}
        answeredAt={answeredAt}
        result={answer}
        guessedCode={guessedCode}
        pending={pending}
        onGuess={(code) => void guess(code)}
        onNext={next}
        isLast={lastCard}
        showCounter={run.total !== null}
        footnote={
          answer && (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className={answer.points > 0 ? 'text-go-deep' : undefined}>
                {t('answer.points', { points: answer.points })}
              </span>
              <span>{t('answer.xp', { xp: answer.xpGained })}</span>
            </span>
          )
        }
      />
    </div>
  );
}

/** Every fifth answer in a row gets a brighter noise than the one before it. */
const STREAK_CHIME_EVERY = 5;

function soundFor(correct: boolean, streak: number): 'correct' | 'wrong' | 'streak' {
  if (!correct) return 'wrong';

  return streak > 0 && streak % STREAK_CHIME_EVERY === 0 ? 'streak' : 'correct';
}

/**
 * Watches the clock while a timed run is on screen and ends it the moment it
 * runs out, even if the player has stopped answering.
 */
function TimeGuard({ endsAt, onExpired }: { endsAt: string; onExpired: () => void }) {
  useEffect(() => {
    const left = new Date(endsAt).getTime() - Date.now();
    const id = window.setTimeout(onExpired, Math.max(0, left));

    return () => window.clearTimeout(id);
  }, [endsAt, onExpired]);

  return null;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-raised mx-auto flex min-h-64 max-w-md flex-col items-center justify-center px-6 py-14 text-center text-muted">
      {children}
    </div>
  );
}
