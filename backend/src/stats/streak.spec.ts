import { describe, expect, it } from 'vitest';

import { calculateStreak } from './streak.js';

const TODAY = new Date('2026-03-10T08:00:00.000Z');

describe('calculateStreak', () => {
  it('counts the consecutive days that end with today', () => {
    const streak = calculateStreak(['2026-03-08', '2026-03-09', '2026-03-10'], TODAY);

    expect(streak).toBe(3);
  });

  it('breaks the streak when the last practice day is older than yesterday', () => {
    const streak = calculateStreak(['2026-03-05', '2026-03-06', '2026-03-07'], TODAY);

    expect(streak).toBe(0);
  });

  it('keeps the streak alive on a day the player has not practised yet', () => {
    const streak = calculateStreak(['2026-03-08', '2026-03-09'], TODAY);

    expect(streak).toBe(2);
  });
});
