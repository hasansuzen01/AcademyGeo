import { describe, expect, it } from 'vitest';

import { rankRows } from './leaderboard.js';

const ROWS = [
  { userId: 'a', score: 900 },
  { userId: 'b', score: 1_200 },
  { userId: 'c', score: 900 },
  { userId: 'd', score: 400 },
];

describe('rankRows', () => {
  it('puts the highest score first', () => {
    expect(rankRows(ROWS).map((row) => row.userId)).toEqual(['b', 'a', 'c', 'd']);
  });

  it('gives two equal scores the same rank', () => {
    const ranked = rankRows(ROWS);

    expect(ranked[1].rank).toBe(2);
    expect(ranked[2].rank).toBe(2);
  });

  it('leaves the gap a tie creates, so a rank always counts those above it', () => {
    expect(rankRows(ROWS)[3].rank).toBe(4);
  });
});
