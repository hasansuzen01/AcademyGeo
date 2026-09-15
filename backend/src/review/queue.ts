import { shuffle } from '../common/shuffle.js';

/**
 * Deals one practice session: a random handful of the cards that match.
 *
 * Practice is a plain quiz. Nothing is held back for a later date, so a set can
 * be played again straight away and a small collection never runs dry.
 */
export function dealPracticeCards(
  metaIds: string[],
  limit: number,
  random: () => number = Math.random,
): string[] {
  return shuffle(metaIds, random).slice(0, limit);
}
