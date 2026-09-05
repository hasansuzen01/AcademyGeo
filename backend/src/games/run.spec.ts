import { describe, expect, it } from 'vitest';

import { advanceRun, startRun } from './run.js';

const START = new Date('2026-01-01T12:00:00.000Z');

function at(seconds: number): Date {
  return new Date(START.getTime() + seconds * 1000);
}

describe('survival', () => {
  it('ends the run once the third wrong answer lands', () => {
    let state = startRun('SURVIVAL', 30, START);
    const wrong = { correct: false, responseMs: 3_000, difficulty: 2 };

    state = advanceRun(state, wrong, at(5));
    state = advanceRun(state, wrong, at(10));
    expect(state.endedFor).toBeNull();

    state = advanceRun(state, wrong, at(15));
    expect(state.endedFor).toBe('lives');
  });
});

describe('rush', () => {
  it('keeps going while the clock has time left', () => {
    const state = advanceRun(startRun('RUSH', 60, START), correctAnswer, at(30));

    expect(state.endedFor).toBeNull();
  });

  it('ends the run on the answer that arrives after the clock runs out', () => {
    const state = advanceRun(startRun('RUSH', 60, START), correctAnswer, at(95));

    expect(state.endedFor).toBe('time');
  });
});

describe('any run', () => {
  it('ends when the deck it was dealt runs out', () => {
    let state = startRun('RUSH', 1, START);

    state = advanceRun(state, correctAnswer, at(4));

    expect(state.endedFor).toBe('cards');
  });
});

describe('a fixed-length run', () => {
  it('ends once every dealt card has been answered', () => {
    let state = startRun('DAILY', 2, START);

    state = advanceRun(state, correctAnswer, at(4));
    expect(state.endedFor).toBeNull();

    state = advanceRun(state, correctAnswer, at(8));
    expect(state.endedFor).toBe('cards');
  });
});

const correctAnswer = { correct: true, responseMs: 3_000, difficulty: 2 };
