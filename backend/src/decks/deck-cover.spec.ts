import { describe, expect, it } from 'vitest';

import { deckCover } from './deck-cover.js';

const card = (overrides: Partial<Parameters<typeof deckCover>[1][number]> = {}) => ({
  imageUrl: 'https://cdn.example/metas/a.jpg',
  imageSource: 'PHOTO',
  isPublished: true,
  imageAuthor: 'Ann',
  imageLicense: 'CC BY 2.0',
  imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:A.jpg',
  ...overrides,
});

describe('deckCover', () => {
  it('uses the cover set in the panel, which credits nobody', () => {
    expect(deckCover('https://cdn.example/decks/cover.jpg', [card()])).toEqual({
      url: 'https://cdn.example/decks/cover.jpg',
      credit: null,
    });
  });

  it('borrows the first published photograph, with its credit, when there is no cover', () => {
    const cover = deckCover(null, [
      card({ imageUrl: '/metas/diagram.svg', imageSource: 'ILLUSTRATION' }),
      card({ imageUrl: 'https://cdn.example/metas/draft.jpg', isPublished: false }),
      card({ imageUrl: 'https://cdn.example/metas/live.jpg', imageAuthor: 'Bo' }),
    ]);

    expect(cover?.url).toBe('https://cdn.example/metas/live.jpg');
    expect(cover?.credit?.author).toBe('Bo');
  });

  it('has no cover when the collection holds no published photograph', () => {
    expect(deckCover('  ', [card({ imageSource: 'ILLUSTRATION' })])).toBeNull();
  });
});
