/**
 * The drill is built from the player's own mistakes: the countries they have
 * guessed wrong most come first, so the session spends its time where the
 * player is actually losing rounds.
 */

export interface DrillCandidate {
  id: string;
  countryCode: string;
  category: string;
}

export interface Weakness {
  /** Wrong answers per country the player should have named. */
  countryMisses: Record<string, number>;
  /** Wrong answers per clue category. */
  categoryMisses?: Record<string, number>;
}

/** Orders the deck by how much the player struggles with it, then deals. */
export function pickDrillMetaIds(
  candidates: DrillCandidate[],
  weakness: Weakness,
  count: number,
): string[] {
  return [...candidates]
    .map((candidate, index) => ({ candidate, index, weight: weightOf(candidate, weakness) }))
    .sort((left, right) => right.weight - left.weight || left.index - right.index)
    .slice(0, count)
    .map((entry) => entry.candidate.id);
}

function weightOf(candidate: DrillCandidate, weakness: Weakness): number {
  const country = weakness.countryMisses[candidate.countryCode] ?? 0;
  const category = weakness.categoryMisses?.[candidate.category] ?? 0;

  // A country miss is the sharper signal: it is the answer the player got
  // wrong, where a category is only the kind of clue it was shown on.
  return country * 3 + category;
}
