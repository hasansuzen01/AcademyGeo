import { describe, expect, it } from 'vitest';

import { pickDailyMetaIds } from './daily.js';

const POOL = Array.from({ length: 40 }, (_, index) => `meta-${index}`);

describe('pickDailyMetaIds', () => {
  it('deals every player the same cards on the same day', () => {
    const morning = pickDailyMetaIds(POOL, '2026-03-14', 10);
    const evening = pickDailyMetaIds(POOL, '2026-03-14', 10);

    expect(morning).toEqual(evening);
  });

  it('deals a different hand the next day', () => {
    const today = pickDailyMetaIds(POOL, '2026-03-14', 10);
    const tomorrow = pickDailyMetaIds(POOL, '2026-03-15', 10);

    expect(today).not.toEqual(tomorrow);
  });

  it('never repeats a card inside one day', () => {
    const hand = pickDailyMetaIds(POOL, '2026-03-14', 10);

    expect(new Set(hand).size).toBe(hand.length);
  });

  it('deals what it has when the deck is smaller than the hand', () => {
    const hand = pickDailyMetaIds(['a', 'b'], '2026-03-14', 10);

    expect(hand).toHaveLength(2);
  });
});
