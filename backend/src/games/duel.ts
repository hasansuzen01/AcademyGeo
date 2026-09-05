import type { ChoiceCountry } from '../review/choices.js';

/** Wrong guesses the player has made, keyed by the country they should have named. */
export type ConfusionMap = Record<string, Record<string, number>>;

/**
 * The other side of a duel: one country, and only one.
 *
 * A duel is worth playing when the two countries are genuinely hard to tell
 * apart, so the opponent is the one this player actually keeps mistaking the
 * answer for. With no history to go on it falls back to a neighbour, because
 * telling Norway from Sweden is the skill; telling it from Brazil is not.
 */
export function pickDuelOpponent(
  answer: ChoiceCountry,
  pool: ChoiceCountry[],
  confusions: ConfusionMap,
  random: () => number = Math.random,
): string | null {
  const candidates = pool.filter((country) => country.code !== answer.code);
  if (candidates.length === 0) return null;

  const misses = confusions[answer.code] ?? {};
  const mistaken = candidates
    .filter((country) => (misses[country.code] ?? 0) > 0)
    .sort((left, right) => (misses[right.code] ?? 0) - (misses[left.code] ?? 0));

  if (mistaken.length > 0) return mistaken[0].code;

  const sameRegion = candidates.filter((country) => country.region === answer.region);
  const shortlist = sameRegion.length > 0 ? sameRegion : candidates;

  return shortlist[Math.floor(random() * shortlist.length)].code;
}
