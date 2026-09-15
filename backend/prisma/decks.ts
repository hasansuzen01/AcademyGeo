/**
 * The starter collections.
 *
 * A deck is a themed run through part of the catalogue: everything a player
 * needs to tell one kind of clue apart, in one sitting. Membership is written
 * as a rule rather than a list of slugs, and the rule fills the deck
 * once, when it is first created.
 *
 * Seeded once and never updated. After that the deck belongs to the panel:
 * cards published later are added to it in /admin/decks, and changing a rule
 * here has no effect on a deck that already exists.
 */
import type { MetaCategory } from './catalogue.ts';

export interface DeckRule {
  /** Only cards in these categories. */
  categories?: MetaCategory[];
  /** Only cards whose country is one of these. */
  countryCodes?: string[];
  /** Only cards at or above this difficulty, where 5 is the hardest. */
  minDifficulty?: number;
}

export interface DeckSeed {
  slug: string;
  nameEn: string;
  nameTr: string;
  descriptionEn: string;
  descriptionTr: string;
  rule: DeckRule;
}

/** Countries in the catalogue that drive on the left. */
const LEFT_HAND_TRAFFIC = ['GB', 'JP', 'TH', 'ID', 'IN', 'AU', 'NZ', 'ZA', 'KE'];

export const DECKS: DeckSeed[] = [
  {
    slug: 'plates-of-the-world',
    nameEn: 'Plates of the world',
    nameTr: 'Dünyanın plakaları',
    descriptionEn:
      'The car in front is usually the first readable thing in a round. Band colour, band position and plate shape narrow a guess to a handful of countries before you have read a single sign.',
    descriptionTr:
      'Öndeki araç, turda okunabilen genelde ilk şeydir. Şerit rengi, şeridin yeri ve plakanın biçimi, daha tek bir tabela okumadan tahmini birkaç ülkeye indirir.',
    rule: { categories: ['PLATE'] },
  },
  {
    slug: 'bollard-field-guide',
    nameEn: 'Bollard field guide',
    nameTr: 'Duba saha rehberi',
    descriptionEn:
      'Roadside bollards are the most reliable clue in Europe: every country picked a shape and a reflector colour decades ago and has stuck with it. This is the set worth memorising first.',
    descriptionTr:
      "Yol kenarı dubaları Avrupa'nın en güvenilir ipucudur: her ülke onlarca yıl önce bir biçim ve reflektör rengi seçti ve ondan şaşmadı. Önce ezberlenmeye değer set budur.",
    rule: { categories: ['BOLLARD'] },
  },
  {
    slug: 'lines-on-the-road',
    nameEn: 'Lines on the road',
    nameTr: 'Yoldaki çizgiler',
    descriptionEn:
      'Centre lines and edge lines are visible from every camera position, in every weather, on every road. Yellow or white, solid or broken, one line or two: each combination rules out most of the map.',
    descriptionTr:
      'Orta ve kenar çizgileri her kamera açısında, her havada, her yolda görünür. Sarı mı beyaz mı, kesiksiz mi kesikli mi, tek mi çift mi: her birleşim haritanın çoğunu eler.',
    rule: { categories: ['ROAD_LINE'] },
  },
  {
    slug: 'left-hand-traffic',
    nameEn: 'Driving on the left',
    nameTr: 'Solda trafik',
    descriptionEn:
      'Which side the traffic drives on halves the map in the first second of a round. These are the countries in the deck that drive on the left, so the habit of checking becomes automatic.',
    descriptionTr:
      'Trafiğin hangi yönden aktığı, turun ilk saniyesinde haritayı ikiye böler. Bunlar destedeki solda giden ülkeler; kontrol etme alışkanlığı böyle otomatikleşir.',
    rule: { countryCodes: LEFT_HAND_TRAFFIC },
  },
  {
    slug: 'reading-the-signs',
    nameEn: 'Script and signage',
    nameTr: 'Alfabe ve tabelalar',
    descriptionEn:
      'When the writing is not Latin, the alphabet alone can settle the country. When it is Latin, the diacritics do the same job more quietly.',
    descriptionTr:
      'Yazı Latin değilse alfabe tek başına ülkeyi belirleyebilir. Latinse aynı işi, daha sessizce, harflerin üstündeki işaretler yapar.',
    rule: { categories: ['LANGUAGE', 'ARCHITECTURE', 'SIGN'] },
  },
  {
    slug: 'hard-mode',
    nameEn: 'Hard mode',
    nameTr: 'Zor mod',
    descriptionEn:
      'The cards experienced players still lose rounds to. Nothing here is obvious at a glance, and most of it comes down to telling two neighbours apart.',
    descriptionTr:
      'Deneyimli oyuncuların hâlâ tur kaybettiği kartlar. Buradaki hiçbir şey ilk bakışta belli olmaz ve çoğu, iki komşuyu birbirinden ayırmaya dayanır.',
    rule: { minDifficulty: 4 },
  },
];
