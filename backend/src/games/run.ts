import { type GameMode, rulesFor } from './modes.js';
import { scoreAnswer } from './scoring.js';

/** Why a run stopped, or null while it is still going. */
export type RunEnd = 'cards' | 'lives' | 'time' | null;

export interface RunState {
  mode: GameMode;
  /** How many cards were dealt to the run. */
  dealt: number;
  answered: number;
  correct: number;
  score: number;
  streak: number;
  bestStreak: number;
  startedAt: number;
  endedFor: RunEnd;
}

export interface RunAnswer {
  correct: boolean;
  responseMs: number;
  difficulty: number;
}

export function startRun(mode: GameMode, dealt: number, now: Date): RunState {
  return {
    mode,
    dealt,
    answered: 0,
    correct: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    startedAt: now.getTime(),
    endedFor: null,
  };
}

/** Folds one answer into the run and decides whether the run is over. */
export function advanceRun(state: RunState, answer: RunAnswer, now: Date): RunState {
  const streak = answer.correct ? state.streak + 1 : 0;
  const next: RunState = {
    ...state,
    answered: state.answered + 1,
    correct: state.correct + (answer.correct ? 1 : 0),
    score: state.score + scoreAnswer({ ...answer, streak: state.streak }),
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
  };

  next.endedFor = endReason(next, now);

  return next;
}

/** The first rule the run has run into, or null while it is still going. */
function endReason(state: RunState, now: Date): RunEnd {
  const rules = rulesFor(state.mode);
  const wrong = state.answered - state.correct;

  if (rules.lives !== null && wrong >= rules.lives) return 'lives';
  if (rules.timeLimitMs !== null && now.getTime() - state.startedAt >= rules.timeLimitMs) {
    return 'time';
  }
  // An untimed, unlimited mode still stops when there is nothing left to
  // deal, so a short catalogue ends the run rather than hanging it.
  if (state.answered >= state.dealt) return 'cards';

  return null;
}
