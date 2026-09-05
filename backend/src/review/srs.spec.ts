import { describe, expect, it } from 'vitest';

import { INITIAL_REVIEW_STATE, type ReviewState, scheduleNextReview } from './srs.js';

const NOW = new Date('2026-01-01T12:00:00.000Z');

describe('scheduleNextReview', () => {
  it('sends a wrong answer back to relearning within the same session', () => {
    const next = scheduleNextReview(
      INITIAL_REVIEW_STATE,
      { correct: false, responseMs: 4_000 },
      NOW,
    );

    expect(next.repetitions).toBe(0);
    expect(next.lapses).toBe(1);
    expect(next.dueAt.getTime() - NOW.getTime()).toBeLessThanOrEqual(10 * 60 * 1000);
  });

  it('schedules the first correct answer one day out', () => {
    const next = scheduleNextReview(
      INITIAL_REVIEW_STATE,
      { correct: true, responseMs: 4_000 },
      NOW,
    );

    expect(next.repetitions).toBe(1);
    expect(next.intervalDays).toBe(1);
    expect(next.dueAt).toEqual(new Date('2026-01-02T12:00:00.000Z'));
  });

  it('schedules the second correct answer six days out', () => {
    const next = scheduleNextReview(
      { repetitions: 1, intervalDays: 1, easeFactor: 2.5, lapses: 0 },
      { correct: true, responseMs: 4_000 },
      NOW,
    );

    expect(next.repetitions).toBe(2);
    expect(next.intervalDays).toBe(6);
    expect(next.dueAt).toEqual(new Date('2026-01-07T12:00:00.000Z'));
  });

  it('multiplies the interval by the ease factor once a card is mature', () => {
    const next = scheduleNextReview(
      { repetitions: 2, intervalDays: 6, easeFactor: 2.5, lapses: 0 },
      { correct: true, responseMs: 4_000 },
      NOW,
    );

    expect(next.repetitions).toBe(3);
    expect(next.intervalDays).toBe(15);
  });

  it('raises the ease factor for fast answers and lowers it for slow ones', () => {
    const mature = {
      repetitions: 2,
      intervalDays: 6,
      easeFactor: 2.5,
      lapses: 0,
    };

    const fast = scheduleNextReview(mature, { correct: true, responseMs: 1_200 }, NOW);
    const slow = scheduleNextReview(mature, { correct: true, responseMs: 14_000 }, NOW);

    expect(fast.easeFactor).toBeGreaterThan(2.5);
    expect(slow.easeFactor).toBeLessThan(2.5);
    expect(fast.intervalDays).toBeGreaterThan(slow.intervalDays);
  });

  it('never lets the ease factor fall below the floor, however often a card is failed', () => {
    let state: ReviewState = INITIAL_REVIEW_STATE;

    for (let attempt = 0; attempt < 20; attempt += 1) {
      state = scheduleNextReview(state, { correct: false, responseMs: 20_000 }, NOW);
    }

    expect(state.easeFactor).toBe(1.3);
    expect(state.lapses).toBe(20);
  });
});
