import { describe, expect, it } from 'vitest';

import { type MapShape, buildMapCountries } from './world-map';

const SHAPES: MapShape[] = [
  { code: 'TR', nameEn: 'Turkey', nameTr: 'Türkiye', d: 'M0 0' },
  { code: 'DE', nameEn: 'Germany', nameTr: 'Almanya', d: 'M1 1' },
  { code: 'AF', nameEn: 'Afghanistan', nameTr: 'Afganistan', d: 'M2 2' },
];

const IN_DECK = [
  { code: 'TR', nameEn: 'Turkey', nameTr: 'Türkiye', clueCount: 3, flagEmoji: '🇹🇷' },
  { code: 'DE', nameEn: 'Germany', nameTr: 'Almanya', clueCount: 0 },
];

describe('buildMapCountries', () => {
  it('carries the deck flag for the label, and none for a country outside the game', () => {
    const shown = buildMapCountries(SHAPES, IN_DECK, 'tr');

    expect(shown.find((c) => c.code === 'TR')?.flag).toBe('🇹🇷');
    expect(shown.find((c) => c.code === 'AF')?.flag).toBeNull();
  });

  it('makes a country with clues something you can open', () => {
    const turkey = buildMapCountries(SHAPES, IN_DECK, 'tr').find((c) => c.code === 'TR');

    expect(turkey?.clueCount).toBe(3);
    expect(turkey?.open).toBe(true);
  });

  // A country in the game already has a page of facts, so it opens before its
  // first clue picture is published.
  it('opens a country in the game even before it has clues', () => {
    const germany = buildMapCountries(SHAPES, IN_DECK, 'tr').find((c) => c.code === 'DE');

    expect(germany?.open).toBe(true);
    expect(germany?.clueCount).toBe(0);
  });

  it('keeps the rest of the world on the map for context', () => {
    const outside = buildMapCountries(SHAPES, IN_DECK, 'tr').find((c) => c.code === 'AF');

    expect(outside).toBeDefined();
    expect(outside?.open).toBe(false);
  });

  it('names a country the way the reader reads the rest of the site', () => {
    const shown = buildMapCountries(SHAPES, IN_DECK, 'tr');

    expect(shown.find((c) => c.code === 'TR')?.name).toBe('Türkiye');
    expect(buildMapCountries(SHAPES, IN_DECK, 'en').find((c) => c.code === 'TR')?.name).toBe(
      'Turkey',
    );
  });

  // A country outside the deck still reads in the language of the page.
  it('names a country outside the deck in the language of the page', () => {
    expect(buildMapCountries(SHAPES, IN_DECK, 'tr').find((c) => c.code === 'AF')?.name).toBe(
      'Afganistan',
    );
    expect(buildMapCountries(SHAPES, IN_DECK, 'en').find((c) => c.code === 'AF')?.name).toBe(
      'Afghanistan',
    );
  });
});
