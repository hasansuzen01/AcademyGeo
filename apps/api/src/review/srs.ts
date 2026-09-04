/**
 * SM-2 variant tuned for GeoGuessr metas: the recall grade is derived from how
 * fast the player answered instead of asking them to self-report difficulty.
 */

/** Persisted scheduling state for a single card belonging to a single user. */
export interface ReviewState {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  lapses: number;
}

export interface ReviewOutcome {
  correct: boolean;
  responseMs: number;
}

export interface ScheduledReview extends ReviewState {
  dueAt: Date;
}

export const INITIAL_REVIEW_STATE: ReviewState = {
  repetitions: 0,
  intervalDays: 0,
  easeFactor: 2.5,
  lapses: 0,
};

const RELEARN_DELAY_MS = 10 * 60 * 1000;
const MIN_EASE_FACTOR = 1.3;
const INSTANT_RECALL_MS = 2_500;
const HESITANT_RECALL_MS = 8_000;

/** SM-2 recall grades, 0-5, where anything below 3 counts as a failure. */
export function gradeAnswer(outcome: ReviewOutcome): number {
  if (!outcome.correct) {
    return outcome.responseMs < HESITANT_RECALL_MS ? 1 : 0;
  }
  if (outcome.responseMs < INSTANT_RECALL_MS) return 5;
  if (outcome.responseMs < HESITANT_RECALL_MS) return 4;
  return 3;
}

export function scheduleNextReview(
  state: ReviewState,
  outcome: ReviewOutcome,
  now: Date,
): ScheduledReview {
  const grade = gradeAnswer(outcome);
  const easeFactor = adjustEaseFactor(state.easeFactor, grade);

  if (!outcome.correct) {
    return {
      repetitions: 0,
      intervalDays: 0,
      easeFactor,
      lapses: state.lapses + 1,
      dueAt: new Date(now.getTime() + RELEARN_DELAY_MS),
    };
  }

  const repetitions = state.repetitions + 1;
  const intervalDays = nextInterval(state.intervalDays, repetitions, easeFactor);

  return {
    repetitions,
    intervalDays,
    easeFactor,
    lapses: state.lapses,
    dueAt: addDays(now, intervalDays),
  };
}

function nextInterval(previousDays: number, repetitions: number, easeFactor: number): number {
  if (repetitions === 1) return 1;
  if (repetitions === 2) return 6;
  return Math.round(previousDays * easeFactor);
}

function adjustEaseFactor(easeFactor: number, grade: number): number {
  const delta = 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
  return Math.max(MIN_EASE_FACTOR, round2(easeFactor + delta));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function addDays(from: Date, days: number): Date {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}
