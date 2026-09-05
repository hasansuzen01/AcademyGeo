import { describe, expect, it } from 'vitest';

import { formatClock, formatDuration, remainingMs } from './run-clock';

describe('remainingMs', () => {
  it('counts down to the moment the clock stops', () => {
    const now = new Date('2026-01-01T12:00:00.000Z').getTime();

    expect(remainingMs('2026-01-01T12:00:30.000Z', now)).toBe(30_000);
  });

  it('never goes below zero once the clock has passed', () => {
    const now = new Date('2026-01-01T12:01:00.000Z').getTime();

    expect(remainingMs('2026-01-01T12:00:30.000Z', now)).toBe(0);
  });

  it('has nothing to count for an untimed run', () => {
    expect(remainingMs(null, Date.now())).toBeNull();
  });
});

describe('formatClock', () => {
  it('reads as a stopwatch', () => {
    expect(formatClock(90_000)).toBe('1:30');
  });

  it('keeps two digits on the seconds', () => {
    expect(formatClock(65_000)).toBe('1:05');
  });

  it('rounds up, so the clock only shows zero when the time is gone', () => {
    expect(formatClock(1)).toBe('0:01');
    expect(formatClock(0)).toBe('0:00');
  });
});

describe('formatDuration', () => {
  it('writes a finished run in minutes and seconds', () => {
    expect(formatDuration(125_000)).toBe('2m 5s');
  });

  it('leaves the minutes off a short run', () => {
    expect(formatDuration(8_400)).toBe('8s');
  });
});
