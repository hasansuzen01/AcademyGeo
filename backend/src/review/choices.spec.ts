import { describe, expect, it } from 'vitest';

import { buildChoices, type ChoiceCountry } from './choices.js';

const TURKEY: ChoiceCountry = { code: 'TR', region: 'ASIA' };
const POOL: ChoiceCountry[] = [
  { code: 'GR', region: 'EUROPE' },
  { code: 'BG', region: 'EUROPE' },
  { code: 'GE', region: 'ASIA' },
  { code: 'AM', region: 'ASIA' },
  { code: 'BR', region: 'SOUTH_AMERICA' },
];

describe('buildChoices', () => {
  it('always offers the correct country among the requested number of options', () => {
    const choices = buildChoices(TURKEY, POOL, 4, () => 0);

    expect(choices).toHaveLength(4);
    expect(choices).toContain('TR');
    expect(new Set(choices).size).toBe(4);
  });

  it('prefers neighbours from the same region as distractors', () => {
    const choices = buildChoices(TURKEY, POOL, 3, () => 0);

    expect(choices.filter((code) => code !== 'TR').sort()).toEqual(['AM', 'GE']);
  });

  it('falls back to other regions when the answer has too few neighbours', () => {
    const brazil: ChoiceCountry = { code: 'BR', region: 'SOUTH_AMERICA' };

    const choices = buildChoices(brazil, POOL, 4, () => 0);

    expect(choices).toHaveLength(4);
    expect(choices).toContain('BR');
    expect(new Set(choices).size).toBe(4);
  });
});
