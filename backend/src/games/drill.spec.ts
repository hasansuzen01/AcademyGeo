import { describe, expect, it } from 'vitest';

import { pickDrillMetaIds } from './drill.js';

const CANDIDATES = [
  { id: 'tr-1', countryCode: 'TR', category: 'PLATE' },
  { id: 'ge-1', countryCode: 'GE', category: 'BOLLARD' },
  { id: 'br-1', countryCode: 'BR', category: 'PLATE' },
  { id: 'jp-1', countryCode: 'JP', category: 'ROAD_LINE' },
];

describe('pickDrillMetaIds', () => {
  it('deals the countries the player keeps missing first', () => {
    const hand = pickDrillMetaIds(CANDIDATES, { countryMisses: { GE: 9, BR: 4 } }, 2);

    expect(hand).toEqual(['ge-1', 'br-1']);
  });

  it('still deals a full hand to a player with nothing to go on', () => {
    expect(pickDrillMetaIds(CANDIDATES, { countryMisses: {} }, 3)).toHaveLength(3);
  });

  it('never deals the same card twice', () => {
    const hand = pickDrillMetaIds(CANDIDATES, { countryMisses: { TR: 2 } }, 4);

    expect(new Set(hand).size).toBe(4);
  });

  it('deals what it has when the deck is short', () => {
    expect(pickDrillMetaIds(CANDIDATES, { countryMisses: {} }, 40)).toHaveLength(4);
  });
});
