import { describe, expect, it } from 'vitest';

import { imageCredit, withCredit } from './image-credit.js';

describe('imageCredit', () => {
  it('gathers who took the photograph, its licence and where it came from', () => {
    expect(
      imageCredit({
        imageAuthor: 'Jane Roe',
        imageLicense: 'CC BY-SA 4.0',
        imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
      }),
    ).toEqual({
      author: 'Jane Roe',
      license: 'CC BY-SA 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
    });
  });

  // The seeded diagrams belong to the project and credit nobody, so the client
  // is given nothing to draw rather than an empty line under the picture.
  it('is null when nothing is credited', () => {
    expect(imageCredit({ imageAuthor: null, imageLicense: null, imageSourceUrl: null })).toBeNull();
  });

  it('treats blank fields as missing', () => {
    expect(imageCredit({ imageAuthor: '  ', imageLicense: '', imageSourceUrl: null })).toBeNull();
  });

  it('swaps the three credit columns on a row for one credit', () => {
    expect(
      withCredit({
        id: 'meta-1',
        imageUrl: '/metas/3f9a.jpg',
        imageAuthor: 'Jane Roe',
        imageLicense: 'CC0',
        imageSourceUrl: null,
      }),
    ).toEqual({
      id: 'meta-1',
      imageUrl: '/metas/3f9a.jpg',
      credit: { author: 'Jane Roe', license: 'CC0', sourceUrl: null },
    });
  });

  it('keeps the parts that are filled in when others are not', () => {
    expect(imageCredit({ imageAuthor: 'Jane Roe', imageLicense: ' CC0 ', imageSourceUrl: '' })).toEqual(
      { author: 'Jane Roe', license: 'CC0', sourceUrl: null },
    );
  });
});
