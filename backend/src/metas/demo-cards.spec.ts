import { describe, expect, it } from 'vitest';

import { pickDemoCards, type DemoSourceCard } from './demo-cards.js';

const countries = [
  { code: 'NO', nameEn: 'Norway', nameTr: 'Norveç', region: 'EUROPE' },
  { code: 'SE', nameEn: 'Sweden', nameTr: 'İsveç', region: 'EUROPE' },
  { code: 'FI', nameEn: 'Finland', nameTr: 'Finlandiya', region: 'EUROPE' },
  { code: 'PL', nameEn: 'Poland', nameTr: 'Polonya', region: 'EUROPE' },
  { code: 'BR', nameEn: 'Brazil', nameTr: 'Brezilya', region: 'SOUTH_AMERICA' },
];

const DAY = '2026-09-24';

const card = (overrides: Partial<DemoSourceCard> = {}): DemoSourceCard => ({
  id: 'm1',
  imageUrl: 'https://cdn.example/metas/a.jpg',
  imageSource: 'PHOTO',
  titleEn: 'Orange reflector',
  titleTr: 'Turuncu reflektör',
  countryCode: 'NO',
  imageAuthor: 'Ann',
  imageLicense: 'CC BY 2.0',
  imageSourceUrl: null,
  ...overrides,
});

describe('pickDemoCards', () => {
  // The landing card is meant to show what a session looks like, so it deals
  // the same photographs the game does, never a stand-in diagram.
  it('deals only real photographs', () => {
    const dealt = pickDemoCards(
      [
        card({ id: 'diagram', imageSource: 'ILLUSTRATION', imageUrl: '/metas/a.svg' }),
        card({ id: 'blank', imageUrl: '' }),
        card({ id: 'photo' }),
      ],
      countries,
      3,
      DAY,
    );

    expect(dealt.map((c) => c.id)).toEqual(['photo']);
  });

  it('offers four same-region choices with the answer among them', () => {
    const [dealt] = pickDemoCards([card()], countries, 1, DAY);

    expect(dealt.answer).toBe('NO');
    expect(dealt.choices).toHaveLength(4);
    expect(dealt.choices.map((c) => c.code)).toContain('NO');
    expect(dealt.choices.map((c) => c.code)).not.toContain('BR');
    expect(dealt.choices.find((c) => c.code === 'NO')).toEqual({
      code: 'NO',
      nameEn: 'Norway',
      nameTr: 'Norveç',
    });
  });

  it('carries the clue title and the photo credit for the reveal', () => {
    const [dealt] = pickDemoCards([card()], countries, 1, DAY);

    expect(dealt.titleTr).toBe('Turuncu reflektör');
    expect(dealt.credit?.author).toBe('Ann');
  });

  // Three Norwegian bollards in a row would make a poor sampler.
  it('deals each country at most once', () => {
    const dealt = pickDemoCards(
      [card({ id: 'a' }), card({ id: 'b' }), card({ id: 'c', countryCode: 'BR' })],
      countries,
      3,
      DAY,
    );

    expect(dealt.map((c) => c.answer).sort()).toEqual(['BR', 'NO']);
  });

  it('stops at the number asked for', () => {
    const dealt = pickDemoCards(
      [
        card({ id: 'a' }),
        card({ id: 'b', countryCode: 'SE' }),
        card({ id: 'c', countryCode: 'FI' }),
      ],
      countries,
      2,
      DAY,
    );

    expect(dealt).toHaveLength(2);
  });

  // Dealing afresh on every request would let anyone poll the endpoint and
  // collect the answer to every photograph. One hand per UTC day gives away
  // three cards a day, however often it is asked.
  it('deals the same hand all day, whatever order the cards arrive in', () => {
    const deck = ['NO', 'SE', 'FI', 'PL', 'BR'].map((code) =>
      card({ id: code, countryCode: code }),
    );

    const morning = pickDemoCards(deck, countries, 3, DAY);
    const evening = pickDemoCards([...deck].reverse(), countries, 3, DAY);

    expect(evening).toEqual(morning);
  });

  // The demo should sample the whole deck over time, not show the same few
  // cards (say, the first ones alphabetically) every day.
  it('deals a fresh random hand each day that roams the whole deck', () => {
    const codes = Array.from({ length: 40 }, (_, i) => `C${String(i).padStart(2, '0')}`);
    const bigAtlas = codes.map((code) => ({ code, nameEn: code, nameTr: code, region: 'EUROPE' }));
    const deck = codes.map((code) => card({ id: `meta-${code}`, countryCode: code }));
    const days = Array.from({ length: 30 }, (_, i) =>
      new Date(Date.UTC(2026, 8, 1 + i)).toISOString().slice(0, 10),
    );

    const hands = days.map((day) => pickDemoCards(deck, bigAtlas, 3, day).map((c) => c.id));

    hands.slice(1).forEach((hand, i) => expect(hand).not.toEqual(hands[i]));
    expect(new Set(hands.flat()).size).toBeGreaterThanOrEqual(30);
  });
});
