import { describe, expect, it } from 'vitest';

import { describeLevel, xpForAnswer } from './levels.js';

describe('describeLevel', () => {
  it('starts a new account at level one', () => {
    expect(describeLevel(0).level).toBe(1);
  });

  it('asks for more experience with every level gained', () => {
    const second = describeLevel(describeLevel(0).nextLevelXp);
    const third = describeLevel(second.nextLevelXp);

    expect(second.level).toBe(2);
    expect(third.level).toBe(3);
    expect(third.nextLevelXp - third.levelStartXp).toBeGreaterThan(
      second.nextLevelXp - second.levelStartXp,
    );
  });

  it('reports how far through the current level the account is', () => {
    const level = describeLevel(25);

    expect(level.level).toBe(1);
    expect(level.progress).toBeGreaterThan(0);
    expect(level.progress).toBeLessThan(1);
  });
});

describe('xpForAnswer', () => {
  it('pays more for a correct answer than a wrong one', () => {
    expect(xpForAnswer({ correct: true, difficulty: 2 })).toBeGreaterThan(
      xpForAnswer({ correct: false, difficulty: 2 }),
    );
  });

  it('still pays something for a wrong answer, because it was still practice', () => {
    expect(xpForAnswer({ correct: false, difficulty: 2 })).toBeGreaterThan(0);
  });

  it('pays more for the harder cards', () => {
    expect(xpForAnswer({ correct: true, difficulty: 5 })).toBeGreaterThan(
      xpForAnswer({ correct: true, difficulty: 1 }),
    );
  });
});
