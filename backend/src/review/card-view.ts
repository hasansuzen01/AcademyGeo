import type { Country, Meta } from '@prisma/client';

import { shuffle } from '../common/shuffle.js';
import { buildChoices } from './choices.js';

/** How many answer buttons sit under a card, unless the mode says otherwise. */
export const CHOICES_PER_CARD = 4;

/** What the client is told about a card. Never the country it belongs to. */
export interface CardView {
  metaId: string;
  category: string;
  imageUrl: string;
  imageSource: string;
  difficulty: number;
  /**
   * How long the picture stays on screen before it is covered, for the modes
   * that take it away. Null everywhere else, where it simply stays up.
   */
  revealMs: number | null;
  choices: Array<{ code: string; nameEn: string; nameTr: string }>;
}

export interface CardViewOptions {
  /** How many buttons to offer. Ignored when the codes are given outright. */
  choiceCount?: number;
  /** The exact answers to offer, for a mode that picks them itself. */
  choiceCodes?: string[];
  revealMs?: number | null;
}

export function toCardView(
  meta: Meta & { country: Country },
  countries: Country[],
  options: CardViewOptions = {},
): CardView {
  const byCode = new Map(countries.map((country) => [country.code, country]));
  // buildChoices shuffles what it picks. A list handed in has not been.
  const codes = options.choiceCodes
    ? shuffle(options.choiceCodes)
    : buildChoices(meta.country, countries, options.choiceCount ?? CHOICES_PER_CARD);

  return {
    metaId: meta.id,
    category: meta.category,
    imageUrl: meta.imageUrl,
    imageSource: meta.imageSource,
    difficulty: meta.difficulty,
    revealMs: options.revealMs ?? null,
    choices: codes.flatMap((code) => {
      const country = byCode.get(code);
      return country ? [{ code: country.code, nameEn: country.nameEn, nameTr: country.nameTr }] : [];
    }),
  };
}
