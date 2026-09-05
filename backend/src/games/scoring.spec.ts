import { describe, expect, it } from 'vitest';

import { scoreAnswer } from './scoring.js';

const CARD = { difficulty: 2 };

describe('scoreAnswer', () => {
  it('scores nothing for a wrong answer', () => {
    const points = scoreAnswer({
      correct: false,
      responseMs: 1_000,
      difficulty: CARD.difficulty,
      streak: 5,
    });

    expect(points).toBe(0);
  });
});

describe('speed', () => {
  it('pays more for a fast correct answer than a slow one', () => {
    const fast = scoreAnswer({ correct: true, responseMs: 900, difficulty: 2, streak: 0 });
    const slow = scoreAnswer({ correct: true, responseMs: 9_000, difficulty: 2, streak: 0 });

    expect(fast).toBeGreaterThan(slow);
  });

  it('stops paying a speed bonus once the answer takes too long', () => {
    const slow = scoreAnswer({ correct: true, responseMs: 15_000, difficulty: 2, streak: 0 });
    const slower = scoreAnswer({ correct: true, responseMs: 60_000, difficulty: 2, streak: 0 });

    expect(slow).toBe(slower);
  });
});

describe('difficulty and streak', () => {
  it('pays more for a card only experienced players recognise', () => {
    const easy = scoreAnswer({ correct: true, responseMs: 4_000, difficulty: 1, streak: 0 });
    const hard = scoreAnswer({ correct: true, responseMs: 4_000, difficulty: 5, streak: 0 });

    expect(hard).toBeGreaterThan(easy);
  });

  it('multiplies the answer by the run of correct answers behind it', () => {
    const cold = scoreAnswer({ correct: true, responseMs: 4_000, difficulty: 2, streak: 0 });
    const hot = scoreAnswer({ correct: true, responseMs: 4_000, difficulty: 2, streak: 6 });

    expect(hot).toBeGreaterThan(cold);
  });

  it('caps the streak multiplier so one long run cannot run away with the board', () => {
    const long = scoreAnswer({ correct: true, responseMs: 4_000, difficulty: 2, streak: 10 });
    const absurd = scoreAnswer({ correct: true, responseMs: 4_000, difficulty: 2, streak: 400 });

    expect(absurd).toBe(long);
  });
});
