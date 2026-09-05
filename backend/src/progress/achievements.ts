/**
 * Badges a player collects along the way. The catalogue lives in code rather
 * than in a table: the name and the description belong in the translation
 * files, and a definition nobody can edit cannot drift out of step with the
 * rule that unlocks it.
 */

export interface ProgressSnapshot {
  totalReviews: number;
  correctReviews: number;
  /** Consecutive days with at least one answer. */
  dayStreak: number;
  level: number;
  bestRunScore: number;
  /** Longest run of correct answers inside a single scored run. */
  bestAnswerStreak: number;
  perfectDailies: number;
  /** Distinct countries the player has answered at least one card for. */
  countriesAnswered: number;
}

export type AchievementTier = 'BRONZE' | 'SILVER' | 'GOLD';

export interface AchievementDefinition {
  code: string;
  tier: AchievementTier;
  /** The snapshot field the badge is measured against, for the progress bar. */
  measure: keyof ProgressSnapshot;
  threshold: number;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { code: 'first-ten', tier: 'BRONZE', measure: 'totalReviews', threshold: 10 },
  { code: 'hundred-cards', tier: 'SILVER', measure: 'totalReviews', threshold: 100 },
  { code: 'thousand-cards', tier: 'GOLD', measure: 'totalReviews', threshold: 1_000 },
  { code: 'week-streak', tier: 'BRONZE', measure: 'dayStreak', threshold: 7 },
  { code: 'month-streak', tier: 'GOLD', measure: 'dayStreak', threshold: 30 },
  { code: 'level-five', tier: 'BRONZE', measure: 'level', threshold: 5 },
  { code: 'level-fifteen', tier: 'SILVER', measure: 'level', threshold: 15 },
  { code: 'level-thirty', tier: 'GOLD', measure: 'level', threshold: 30 },
  { code: 'hot-streak', tier: 'SILVER', measure: 'bestAnswerStreak', threshold: 15 },
  { code: 'unbroken', tier: 'GOLD', measure: 'bestAnswerStreak', threshold: 40 },
  { code: 'rush-two-thousand', tier: 'SILVER', measure: 'bestRunScore', threshold: 2_000 },
  { code: 'rush-five-thousand', tier: 'GOLD', measure: 'bestRunScore', threshold: 5_000 },
  { code: 'daily-perfect', tier: 'SILVER', measure: 'perfectDailies', threshold: 1 },
  { code: 'daily-ten-perfect', tier: 'GOLD', measure: 'perfectDailies', threshold: 10 },
  { code: 'globetrotter', tier: 'SILVER', measure: 'countriesAnswered', threshold: 25 },
  { code: 'cartographer', tier: 'GOLD', measure: 'countriesAnswered', threshold: 60 },
];

/** Every badge the snapshot now earns that the player did not already hold. */
export function newlyUnlocked(snapshot: ProgressSnapshot, held: string[]): string[] {
  const alreadyHeld = new Set(held);

  return ACHIEVEMENTS.filter(
    (achievement) =>
      !alreadyHeld.has(achievement.code) &&
      snapshot[achievement.measure] >= achievement.threshold,
  ).map((achievement) => achievement.code);
}

/** The catalogue with the player's standing against each badge, for the wall. */
export function achievementProgress(snapshot: ProgressSnapshot, held: string[]) {
  const heldCodes = new Set(held);

  return ACHIEVEMENTS.map((achievement) => ({
    code: achievement.code,
    tier: achievement.tier,
    threshold: achievement.threshold,
    current: Math.min(snapshot[achievement.measure], achievement.threshold),
    unlocked: heldCodes.has(achievement.code),
  }));
}
