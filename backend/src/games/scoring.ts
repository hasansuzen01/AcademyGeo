export interface AnswerScore {
  correct: boolean;
  responseMs: number;
  /** 1 = obvious at a glance, 5 = only recognisable to experienced players. */
  difficulty: number;
  /** Correct answers already behind this one in the same run. */
  streak: number;
}

const BASE_POINTS = 100;
/** Answering inside this window still earns part of the speed bonus. */
const SPEED_WINDOW_MS = 12_000;
const MAX_SPEED_BONUS = 60;
const DIFFICULTY_BONUS = 25;
const STREAK_STEP = 0.1;
/** Beyond this the multiplier stops growing, so one long run cannot run away
 *  with the leaderboard. */
const MAX_STREAK_STEPS = 10;

/**
 * Points for one answer: a flat base, a bonus for answering quickly, a bonus
 * for the harder cards, and a multiplier for the run of correct answers behind
 * it. A wrong answer is worth nothing.
 */
export function scoreAnswer(answer: AnswerScore): number {
  if (!answer.correct) return 0;

  const remaining = Math.max(0, SPEED_WINDOW_MS - answer.responseMs);
  const speedBonus = Math.round((remaining / SPEED_WINDOW_MS) * MAX_SPEED_BONUS);
  const difficultyBonus = (clampDifficulty(answer.difficulty) - 1) * DIFFICULTY_BONUS;

  return Math.round((BASE_POINTS + speedBonus + difficultyBonus) * streakMultiplier(answer.streak));
}

/** 1x with nothing behind you, rising to 2x once ten answers are in a row. */
export function streakMultiplier(streak: number): number {
  return 1 + Math.min(Math.max(0, streak), MAX_STREAK_STEPS) * STREAK_STEP;
}

function clampDifficulty(difficulty: number): number {
  return Math.min(5, Math.max(1, Math.round(difficulty)));
}
