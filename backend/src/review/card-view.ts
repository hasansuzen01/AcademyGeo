import type { Country, Meta } from '@prisma/client';

import { buildChoices } from './choices.js';

/** How many answer buttons sit under a card. */
export const CHOICES_PER_CARD = 4;

/** What the client is told about a card. Never the country it belongs to. */
export interface CardView {
  metaId: string;
  category: string;
  imageUrl: string;
  imageSource: string;
  difficulty: number;
  choices: Array<{ code: string; nameEn: string; nameTr: string }>;
}

export function toCardView(meta: Meta & { country: Country }, countries: Country[]): CardView {
  const byCode = new Map(countries.map((country) => [country.code, country]));

  return {
    metaId: meta.id,
    category: meta.category,
    imageUrl: meta.imageUrl,
    imageSource: meta.imageSource,
    difficulty: meta.difficulty,
    choices: buildChoices(meta.country, countries, CHOICES_PER_CARD).flatMap((code) => {
      const country = byCode.get(code);
      return country ? [{ code: country.code, nameEn: country.nameEn, nameTr: country.nameTr }] : [];
    }),
  };
}
