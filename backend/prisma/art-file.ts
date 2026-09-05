import { createHash } from 'node:crypto';

/**
 * The filename a card's illustration is written to.
 *
 * It is a hash of the slug rather than the slug itself because the picture is
 * the question: a file called `tr-plate.svg` hands the answer to anyone who
 * opens the network tab, and a leaderboard is only worth something if it
 * cannot be read off a URL. The hash is stable, so re-running the generator
 * overwrites the same file rather than filling the folder with orphans.
 */
export function artFileName(slug: string): string {
  return `${createHash('sha256').update(slug).digest('hex').slice(0, 16)}.svg`;
}
