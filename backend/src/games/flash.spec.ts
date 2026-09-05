import { describe, expect, it } from 'vitest';

import { MIN_REVEAL_MS, revealWindowMs } from './flash.js';

describe('revealWindowMs', () => {
  it('gives the first card a good long look', () => {
    expect(revealWindowMs(0)).toBeGreaterThan(3_000);
  });

  it('shortens the look as the run of correct answers grows', () => {
    expect(revealWindowMs(4)).toBeLessThan(revealWindowMs(0));
    expect(revealWindowMs(8)).toBeLessThan(revealWindowMs(4));
  });

  it('never drops below a window a person can actually read', () => {
    expect(revealWindowMs(500)).toBe(MIN_REVEAL_MS);
  });

  it('opens back up when a wrong answer resets the streak', () => {
    expect(revealWindowMs(0)).toBeGreaterThan(revealWindowMs(6));
  });
});
