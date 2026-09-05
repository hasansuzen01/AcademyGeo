import { shuffle } from '../common/shuffle.js';

export interface ChoiceCountry {
  code: string;
  region: string;
}

/**
 * Builds the multiple-choice answers shown under a flashcard. Distractors are
 * drawn from the answer's own region first: telling Turkey from Georgia is the
 * skill worth training, telling it from Brazil is not.
 */
export function buildChoices(
  answer: ChoiceCountry,
  pool: ChoiceCountry[],
  count: number,
  random: () => number = Math.random,
): string[] {
  const candidates = pool.filter((country) => country.code !== answer.code);
  const sameRegion = candidates.filter((country) => country.region === answer.region);
  const elsewhere = candidates.filter((country) => country.region !== answer.region);

  const distractors = [...shuffle(sameRegion, random), ...shuffle(elsewhere, random)]
    .slice(0, Math.max(0, count - 1))
    .map((country) => country.code);

  return shuffle([answer.code, ...distractors], random);
}
