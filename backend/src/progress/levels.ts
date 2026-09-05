/**
 * Experience turns practice into something a player can watch grow even on a
 * day when the answers go badly. Every answer pays, a correct one pays more,
 * and each level costs more than the one before it.
 */

const XP_PER_LEVEL_STEP = 50;
const XP_CORRECT = 12;
const XP_WRONG = 4;
const XP_PER_DIFFICULTY = 3;

export interface LevelDescription {
  level: number;
  xp: number;
  /** Total experience the account had when this level began. */
  levelStartXp: number;
  /** Total experience that will start the next level. */
  nextLevelXp: number;
  /** How far through the current level, 0 to 1. */
  progress: number;
}

/** Total experience needed to have reached a level. Level 1 starts at zero. */
export function xpToReachLevel(level: number): number {
  const steps = Math.max(0, level - 1);
  return (XP_PER_LEVEL_STEP * steps * (steps + 1)) / 2;
}

export function describeLevel(xp: number): LevelDescription {
  const safeXp = Math.max(0, Math.floor(xp));

  let level = 1;
  while (xpToReachLevel(level + 1) <= safeXp) level += 1;

  const levelStartXp = xpToReachLevel(level);
  const nextLevelXp = xpToReachLevel(level + 1);

  return {
    level,
    xp: safeXp,
    levelStartXp,
    nextLevelXp,
    progress: (safeXp - levelStartXp) / (nextLevelXp - levelStartXp),
  };
}

/** What one answer is worth. Getting it wrong was still practice. */
export function xpForAnswer(answer: { correct: boolean; difficulty: number }): number {
  const difficulty = Math.min(5, Math.max(1, Math.round(answer.difficulty)));
  const base = answer.correct ? XP_CORRECT : XP_WRONG;

  return base + (answer.correct ? (difficulty - 1) * XP_PER_DIFFICULTY : 0);
}
