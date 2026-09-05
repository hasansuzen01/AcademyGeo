import { describe, expect, it } from 'vitest';

import { buildDeckOrder } from './deck-order.js';

describe('buildDeckOrder', () => {
  it('numbers the requested metas from zero in the order they were given', () => {
    const order = buildDeckOrder(['b', 'a', 'c'], new Set(['a', 'b', 'c']));

    expect(order).toEqual([
      { metaId: 'b', position: 0 },
      { metaId: 'a', position: 1 },
      { metaId: 'c', position: 2 },
    ]);
  });

  it('drops ids that are not metas, leaving no gap in the positions', () => {
    const order = buildDeckOrder(['a', 'ghost', 'c'], new Set(['a', 'c']));

    expect(order).toEqual([
      { metaId: 'a', position: 0 },
      { metaId: 'c', position: 1 },
    ]);
  });

  it('keeps only the first appearance when a meta is listed twice', () => {
    const order = buildDeckOrder(['a', 'b', 'a'], new Set(['a', 'b']));

    expect(order).toEqual([
      { metaId: 'a', position: 0 },
      { metaId: 'b', position: 1 },
    ]);
  });
});
