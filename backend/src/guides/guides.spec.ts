import { describe, expect, it } from 'vitest';

import { type ExampleRow, guideExamples, nextEntry, summariseTopic } from './guides.js';

describe('summariseTopic', () => {
  const entry = (status: 'DRAFT' | 'PUBLISHED', readingTime: number) => ({
    status,
    readingTime,
  });

  it('counts the entries a reader can open and how long they take', () => {
    const summary = summariseTopic([entry('PUBLISHED', 3), entry('PUBLISHED', 4)]);

    expect(summary).toEqual({ entryCount: 2, readingTime: 7 });
  });

  // The count sits on a public card, so a half-written entry must not inflate
  // it and then send the reader to a heading with less on it than promised.
  it('leaves drafts out of both numbers', () => {
    const summary = summariseTopic([entry('PUBLISHED', 3), entry('DRAFT', 9)]);

    expect(summary).toEqual({ entryCount: 1, readingTime: 3 });
  });

  it('reports nothing rather than a minute for an empty heading', () => {
    expect(summariseTopic([])).toEqual({ entryCount: 0, readingTime: 0 });
  });
});

describe('nextEntry', () => {
  const readable = [
    { slug: 'wooden-poles', title: 'Wooden poles' },
    { slug: 'concrete-poles', title: 'Concrete poles' },
    { slug: 'lattice-towers', title: 'Lattice towers' },
  ];

  // Finishing an article is the moment a reader is most willing to read
  // another, so the heading has to offer the one that follows.
  it('offers the entry that follows this one', () => {
    expect(nextEntry(readable, 'wooden-poles')).toEqual(readable[1]);
  });

  it('offers nothing after the last entry', () => {
    expect(nextEntry(readable, 'lattice-towers')).toBeNull();
  });

  it('offers nothing when the entry is not in the heading', () => {
    expect(nextEntry(readable, 'painted-kerbs')).toBeNull();
  });
});

describe('guideExamples', () => {
  const row = (code: string, nameEn: string, nameTr: string): ExampleRow => ({
    id: `${code}-id`,
    slug: `${code.toLowerCase()}-sign`,
    titleEn: `${nameEn} sign`,
    titleTr: `${nameTr} tabelası`,
    descriptionEn: `How a ${nameEn} sign looks.`,
    descriptionTr: `${nameTr} tabelası böyle görünür.`,
    imageUrl: `https://cdn.example/${code}.jpg`,
    imageAuthor: 'Jane Doe',
    imageLicense: 'CC BY-SA 4.0',
    imageSourceUrl: null,
    country: { code, nameEn, nameTr, flagEmoji: '🏳️' },
  });

  // A heading is written for one audience, so the photo cards under it have
  // to speak that audience's language, credit included.
  it('shows each card in the language the heading is written in', () => {
    const [example] = guideExamples('tr', [row('CL', 'Chile', 'Şili')]);

    expect(example).toEqual({
      id: 'CL-id',
      slug: 'cl-sign',
      title: 'Şili tabelası',
      description: 'Şili tabelası böyle görünür.',
      imageUrl: 'https://cdn.example/CL.jpg',
      credit: { author: 'Jane Doe', license: 'CC BY-SA 4.0', sourceUrl: null },
      country: { code: 'CL', name: 'Şili', flagEmoji: '🏳️' },
    });
  });

  // Readers scan a long gallery for their country by name, so the order has
  // to be the one their alphabet uses: Ç after C and Ş after S in Turkish.
  it('goes country by country in the reader’s alphabetical order', () => {
    const rows = [
      row('CL', 'Chile', 'Şili'),
      row('CN', 'China', 'Çin'),
      row('RS', 'Serbia', 'Sırbistan'),
      row('DZ', 'Algeria', 'Cezayir'),
    ];

    const names = (locale: string) =>
      guideExamples(locale, rows).map((example) => example.country.name);

    expect(names('tr')).toEqual(['Cezayir', 'Çin', 'Sırbistan', 'Şili']);
    expect(names('en')).toEqual(['Algeria', 'Chile', 'China', 'Serbia']);
  });
});
