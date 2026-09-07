import { describe, expect, it } from 'vitest';

import { nextEntry, summariseTopic } from './guides.js';

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
