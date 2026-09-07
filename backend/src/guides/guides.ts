import type { ContentStatus } from '@prisma/client';

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
