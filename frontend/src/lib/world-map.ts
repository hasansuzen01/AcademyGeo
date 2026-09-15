// The geometry is only ever read on the server. Importing this from a client
// component would put the whole world in the browser bundle as well as in the
// page it is already rendered into.
import shapesData from './world-map.json';

export interface MapShape {
  /** ISO 3166-1 alpha-2. */
  code: string;
  /** The map's own names, for the countries the deck does not cover. */
  nameEn: string;
  nameTr: string;
  /** An SVG path, already projected. */
  d: string;
}

export interface MapCountry extends MapShape {
  /** The name in the language of the page. */
  name: string;
  clueCount: number;
  /** Whether the country has a page worth opening. */
  open: boolean;
}

interface DeckCountry {
  code: string;
  nameEn: string;
  nameTr: string;
  clueCount: number;
}

export const WORLD = shapesData as { width: number; height: number; shapes: MapShape[] };

/**
 * The whole world, with the countries the deck covers marked out.
 *
 * Everything is drawn, including the countries with nothing to show: a map
 * with holes in it reads as a broken map rather than as an unfinished deck.
 */
export function buildMapCountries(
  shapes: MapShape[],
  deck: DeckCountry[],
  locale: string,
): MapCountry[] {
  const byCode = new Map(deck.map((country) => [country.code, country]));

  const turkish = locale === 'tr';

  return shapes.map((shape) => {
    // The deck's own name wins where there is one: it is the name the cards
    // and the answer buttons use, and the map should not disagree with them.
    const known = byCode.get(shape.code);
    const clueCount = known?.clueCount ?? 0;
    const named = known ?? shape;

    return {
      ...shape,
      name: turkish ? named.nameTr : named.nameEn,
      clueCount,
      // Every country in the game has a page of verified facts, so it is worth
      // opening before its first clue picture is published. The rest of the
      // world stays flat.
      open: known !== undefined,
    };
  });
}
