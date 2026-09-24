import { shuffle } from '../common/shuffle.js';
import { dayRandom } from '../games/daily.js';
import { buildChoices } from '../review/choices.js';
import { CHOICES_PER_CARD, namedChoices } from '../review/card-view.js';
import { type CreditColumns, type ImageCredit, withCredit } from './image-credit.js';

export interface DemoSourceCard extends CreditColumns {
  id: string;
  imageUrl: string;
  imageSource: string;
  titleEn: string;
  titleTr: string;
  countryCode: string;
}

export interface DemoCountry {
  code: string;
  nameEn: string;
  nameTr: string;
  region: string;
}

/**
 * A card for the landing page's live demo. Unlike a question in a session it
 * names its answer: the demo reveals it in the browser, and the handful of
 * cards dealt here are a sampler, not the deck.
 */
export interface DemoCard {
  id: string;
  imageUrl: string;
  titleEn: string;
  titleTr: string;
  answer: string;
  choices: Array<{ code: string; nameEn: string; nameTr: string }>;
  credit: ImageCredit | null;
}

/**
 * Deals up to `count` real photographs, one per country, with their choices.
 * The hand is fixed for the UTC `day`: dealing afresh on every request would
 * let anyone poll the endpoint until they held the answer to every photograph.
 */
export function pickDemoCards(
  cards: DemoSourceCard[],
  countries: DemoCountry[],
  count: number,
  day: string,
): DemoCard[] {
  const random = dayRandom(day);
  const byCode = new Map(countries.map((country) => [country.code, country]));
  const seen = new Set<string>();
  const dealt: DemoCard[] = [];

  const inStableOrder = [...cards].sort((a, b) => a.id.localeCompare(b.id));

  for (const card of shuffle(inStableOrder, random)) {
    if (dealt.length === count) break;
    const country = byCode.get(card.countryCode);
    if (!country || card.imageSource !== 'PHOTO' || !card.imageUrl || seen.has(country.code)) {
      continue;
    }
    seen.add(country.code);

    const { id, imageUrl, titleEn, titleTr, credit } = withCredit(card);
    dealt.push({
      id,
      imageUrl,
      titleEn,
      titleTr,
      credit,
      answer: country.code,
      choices: namedChoices(buildChoices(country, countries, CHOICES_PER_CARD, random), countries),
    });
  }

  return dealt;
}
