import { describe, expect, it } from 'vitest';

import { ACHIEVEMENTS, type ProgressSnapshot, newlyUnlocked } from './achievements.js';

const NOTHING_YET: ProgressSnapshot = {
  totalReviews: 0,
  correctReviews: 0,
  dayStreak: 0,
  level: 1,
  bestRunScore: 0,
  bestAnswerStreak: 0,
  perfectDailies: 0,
  countriesAnswered: 0,
};

describe('newlyUnlocked', () => {
  it('gives a fresh account nothing', () => {
    expect(newlyUnlocked(NOTHING_YET, [])).toEqual([]);
  });

  it('unlocks the first milestone once the player has practised enough', () => {
    const unlocked = newlyUnlocked({ ...NOTHING_YET, totalReviews: 10 }, []);

    expect(unlocked).toContain('first-ten');
  });

  it('does not hand out an achievement the player already has', () => {
    const unlocked = newlyUnlocked({ ...NOTHING_YET, totalReviews: 10 }, ['first-ten']);

    expect(unlocked).not.toContain('first-ten');
  });

  it('names only achievements it actually defines', () => {
    const codes = new Set(ACHIEVEMENTS.map((achievement) => achievement.code));
    const unlocked = newlyUnlocked(
      {
        totalReviews: 5_000,
        correctReviews: 4_800,
        dayStreak: 120,
        level: 40,
        bestRunScore: 99_999,
        bestAnswerStreak: 80,
        perfectDailies: 30,
        countriesAnswered: 200,
      },
      [],
    );

    expect(unlocked.length).toBeGreaterThan(5);
    for (const code of unlocked) expect(codes.has(code)).toBe(true);
  });
});
