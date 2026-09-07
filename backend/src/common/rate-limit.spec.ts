import { describe, expect, it } from 'vitest';

import { windowKey } from './rate-limit.js';

const WINDOW_MS = 60_000;

describe('windowKey', () => {
  it('keeps two callers on the same route apart', () => {
    const a = windowKey('sign', '1.1.1.1', 0, WINDOW_MS);
    const b = windowKey('sign', '2.2.2.2', 0, WINDOW_MS);

    expect(a).not.toBe(b);
  });

  it('keeps one caller on two routes apart', () => {
    expect(windowKey('sign', '1.1.1.1', 0, WINDOW_MS)).not.toBe(
      windowKey('answer', '1.1.1.1', 0, WINDOW_MS),
    );
  });

  // A fixed window: two calls inside the same minute share a counter, and the
  // next minute starts a new one rather than inheriting the old count.
  it('shares a counter within the window', () => {
    expect(windowKey('sign', '1.1.1.1', 1_000, WINDOW_MS)).toBe(
      windowKey('sign', '1.1.1.1', 59_999, WINDOW_MS),
    );
  });

  it('starts a new counter in the next window', () => {
    expect(windowKey('sign', '1.1.1.1', 59_999, WINDOW_MS)).not.toBe(
      windowKey('sign', '1.1.1.1', 60_000, WINDOW_MS),
    );
  });
});
