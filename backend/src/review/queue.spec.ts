import { describe, expect, it } from 'vitest';

import { dealPracticeCards } from './queue.js';

const IDS = Array.from({ length: 30 }, (_, index) => `meta-${index}`);

describe('dealPracticeCards', () => {
  it('deals a full session from a large set, with no card twice', () => {
    const dealt = dealPracticeCards(IDS, 12);

    expect(dealt).toHaveLength(12);
    expect(new Set(dealt).size).toBe(12);
    expect(dealt.every((id) => IDS.includes(id))).toBe(true);
  });

  it('deals every card of a set smaller than a session', () => {
    expect(dealPracticeCards(['a', 'b', 'c'], 12).sort()).toEqual(['a', 'b', 'c']);
  });

  it('draws a different hand when the dice fall differently', () => {
    expect(dealPracticeCards(IDS, 12, () => 0)).not.toEqual(dealPracticeCards(IDS, 12, () => 0.999));
  });

  it('leaves the list it was given alone', () => {
    const ids = ['a', 'b', 'c', 'd'];
    dealPracticeCards(ids, 2, () => 0);

    expect(ids).toEqual(['a', 'b', 'c', 'd']);
  });
});
