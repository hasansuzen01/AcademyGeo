import type { ContentStatus } from '@prisma/client';

import { type CreditColumns, type ImageCredit, imageCredit } from '../metas/image-credit.js';

export interface TopicSummary {
  entryCount: number;
  readingTime: number;
}

/**
 * What the topic card promises: how many entries a reader can open under the
 * heading, and how long they take together.
 *
 * Drafts are left out of both. The card is public, and a count that includes
 * unfinished work sends the reader to a heading with less on it than the card
 * said there was.
 */
export function summariseTopic(
  entries: Array<{ status: ContentStatus; readingTime: number }>,
): TopicSummary {
  const readable = entries.filter((entry) => entry.status === 'PUBLISHED');

  return {
    entryCount: readable.length,
    readingTime: readable.reduce((total, entry) => total + entry.readingTime, 0),
  };
}

/**
 * The entry to offer once this one has been read.
 *
 * Finishing an article is when a reader is most willing to start another, so
 * the heading points at the one that follows rather than sending them back to
 * the list. The end of the heading is the end: nothing wraps around.
 */
export function nextEntry<T extends { slug: string }>(readable: T[], slug: string): T | null {
  const position = readable.findIndex((entry) => entry.slug === slug);
  if (position === -1) return null;

  return readable[position + 1] ?? null;
}

/** A published photo card of the heading's clue type, as the database hands it over. */
export interface ExampleRow extends CreditColumns {
  id: string;
  slug: string;
  titleEn: string;
  titleTr: string;
  descriptionEn: string;
  descriptionTr: string;
  imageUrl: string;
  country: { code: string; nameEn: string; nameTr: string; flagEmoji: string | null };
}

/** One country's photo under a heading, in the heading's language. */
export interface GuideExample {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  credit: ImageCredit | null;
  country: { code: string; name: string; flagEmoji: string | null };
}

/**
 * The photo cards shown under a heading.
 *
 * A card already says which country it is from and what kind of clue it
 * shows, so a heading needs no pictures of its own: the cards added for
 * practice are the guide's examples. The credit rides along because the
 * country is named here anyway, so it gives no answer away.
 */
export function guideExamples(locale: string, rows: ExampleRow[]): GuideExample[] {
  const tr = locale === 'tr';

  const examples = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: tr ? row.titleTr : row.titleEn,
    description: tr ? row.descriptionTr : row.descriptionEn,
    imageUrl: row.imageUrl,
    credit: imageCredit(row),
    country: {
      code: row.country.code,
      name: tr ? row.country.nameTr : row.country.nameEn,
      flagEmoji: row.country.flagEmoji,
    },
  }));

  // Sorted by the name as the reader's alphabet orders it, not by code point,
  // which would file Çin after Sırbistan.
  return examples.sort((a, b) => a.country.name.localeCompare(b.country.name, locale));
}
