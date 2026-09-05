import { describe, expect, it } from 'vitest';

import { groupClues } from './group-clues.js';

const CLUES = [
  { id: '1', category: 'ARCHITECTURE' },
  { id: '2', category: 'PLATE' },
  { id: '3', category: 'BOLLARD' },
  { id: '4', category: 'PLATE' },
];

describe('groupClues', () => {
  it('reads in the order a player would look at a street, not alphabetically', () => {
    expect(groupClues(CLUES).map((group) => group.category)).toEqual([
      'PLATE',
      'BOLLARD',
      'ARCHITECTURE',
    ]);
  });

  it('keeps every clue of a category together', () => {
    const plates = groupClues(CLUES).find((group) => group.category === 'PLATE');

    expect(plates?.clues.map((clue) => clue.id)).toEqual(['2', '4']);
  });

  it('leaves out a category the country has no clue for', () => {
    expect(groupClues(CLUES).some((group) => group.category === 'VEGETATION')).toBe(false);
  });
});
