/**
 * The order a player actually works through a street view: what is painted on
 * the car in front, then the roadside furniture, then the road itself, then
 * the wider scene. Alphabetical order would scatter that.
 */
export const CLUE_ORDER = [
  'PLATE',
  'VEHICLE',
  'BOLLARD',
  'ROAD_LINE',
  'INFRASTRUCTURE',
  'LANGUAGE',
  'ARCHITECTURE',
  'VEGETATION',
  'CAMERA',
] as const;

export interface CategorisedClue {
  category: string;
}

export interface ClueGroup<T extends CategorisedClue> {
  category: string;
  clues: T[];
}

/** Groups a country's clues for display, dropping the categories it has none of. */
export function groupClues<T extends CategorisedClue>(clues: T[]): ClueGroup<T>[] {
  // A category the order does not name still gets shown, once, at the end.
  const order = [...new Set<string>([...CLUE_ORDER, ...clues.map((clue) => clue.category)])];

  return order.flatMap((category) => {
    const matching = clues.filter((clue) => clue.category === category);
    return matching.length === 0 ? [] : [{ category, clues: matching }];
  });
}
