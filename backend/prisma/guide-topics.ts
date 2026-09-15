import type { MetaCategory } from '@prisma/client';

/**
 * The headings the guide library opens with, one per kind of clue.
 *
 * Only the headings. What goes under them is written in the admin panel, by
 * whoever knows the metas, so nothing here pretends to be that knowledge.
 * They are seeded as drafts and stay invisible until someone has written
 * enough under one to be worth publishing.
 *
 * Seeded once and never updated: a heading whose wording has been changed in
 * the panel belongs to whoever changed it.
 */
export interface GuideTopicSeed {
  locale: string;
  slug: string;
  title: string;
  summary: string;
  icon: string;
  category: MetaCategory | null;
  position: number;
}

interface Pair {
  slug: { en: string; tr: string };
  title: { en: string; tr: string };
  summary: { en: string; tr: string };
  icon: string;
  category: MetaCategory | null;
}

const TOPICS: Pair[] = [
  {
    slug: { en: 'poles', tr: 'elektrik-direkleri' },
    title: { en: 'Power poles', tr: 'Elektrik direkleri' },
    summary: {
      en: 'Wood or concrete, how the crossarms sit, where the insulators go. Poles line every road and change at almost every border.',
      tr: 'Ahşap mı beton mu, traversler nasıl duruyor, izolatörler nerede. Direkler her yolun kenarında var ve neredeyse her sınırda değişiyor.',
    },
    icon: 'utility-pole',
    category: 'POLE',
  },
  {
    slug: { en: 'road-lines', tr: 'yol-cizgileri' },
    title: { en: 'Road lines', tr: 'Yol çizgileri' },
    summary: {
      en: 'Yellow or white, one line or two, solid or dashed, and how the edge is painted. The cheapest clue to check and one of the strongest.',
      tr: 'Sarı mı beyaz mı, tek çizgi mi çift mi, kesik mi düz mü, kenar nasıl boyanmış. Bakması en kolay, en güçlü ipuçlarından biri.',
    },
    icon: 'route',
    category: 'ROAD_LINE',
  },
  {
    slug: { en: 'bollards', tr: 'dubalar' },
    title: { en: 'Bollards', tr: 'Dubalar ve delineatörler' },
    summary: {
      en: 'The single most country-specific object on a European roadside. Head shape, stripe, reflector colour and which side it faces.',
      tr: 'Avrupa yol kenarındaki en ülkeye özgü nesne. Baş şekli, şerit, reflektör rengi ve hangi tarafa baktığı.',
    },
    icon: 'traffic-cone',
    category: 'BOLLARD',
  },
  {
    slug: { en: 'signs', tr: 'tabelalar' },
    title: { en: 'Signs', tr: 'Tabelalar' },
    summary: {
      en: 'Shape, border, backing colour and the typeface on them. Signs carry both the country and, often, the region.',
      tr: 'Şekil, kenarlık, zemin rengi ve üzerindeki yazı tipi. Tabelalar hem ülkeyi hem çoğu zaman bölgeyi taşır.',
    },
    icon: 'signpost',
    category: 'SIGN',
  },
  {
    slug: { en: 'plates', tr: 'plakalar' },
    title: { en: 'Number plates', tr: 'Plakalar' },
    summary: {
      en: 'The blue strip, the proportions, the colour of the characters. Readable at a surprising distance once you know what to look for.',
      tr: 'Mavi şerit, oranlar, karakterlerin rengi. Neye bakacağını bilince şaşırtıcı uzaklıktan okunuyor.',
    },
    icon: 'car',
    category: 'PLATE',
  },
  {
    slug: { en: 'script-and-language', tr: 'yazi-ve-dil' },
    title: { en: 'Script and language', tr: 'Yazı ve dil' },
    summary: {
      en: 'Which alphabet, which accented letters, and the words that only appear in one country.',
      tr: 'Hangi alfabe, hangi şapkalı harfler ve yalnızca tek bir ülkede geçen kelimeler.',
    },
    icon: 'languages',
    category: 'LANGUAGE',
  },
  {
    slug: { en: 'the-car', tr: 'google-araci' },
    title: { en: 'The camera car', tr: 'Google aracı' },
    summary: {
      en: 'The rig, the blur, the snorkel, the colour of the bonnet. What the car itself gives away before you have looked at the road.',
      tr: 'Kamera düzeneği, bulanıklık, şnorkel, kaputun rengi. Daha yola bakmadan aracın kendisi neyi ele veriyor.',
    },
    icon: 'camera',
    category: 'CAMERA',
  },
  {
    slug: { en: 'vegetation-and-terrain', tr: 'bitki-ortusu-ve-arazi' },
    title: { en: 'Vegetation and terrain', tr: 'Bitki örtüsü ve arazi' },
    summary: {
      en: 'Soil colour, which trees, how dense, and what the horizon does. Narrows a continent down to a corner of it.',
      tr: 'Toprağın rengi, hangi ağaçlar, ne sıklıkta ve ufuk ne yapıyor. Bir kıtayı köşesine kadar daraltır.',
    },
    icon: 'trees',
    category: 'VEGETATION',
  },
  {
    slug: { en: 'buildings', tr: 'yapilar' },
    title: { en: 'Buildings', tr: 'Yapılar' },
    summary: {
      en: 'Roof pitch, window shape, balconies, what the walls are made of and how they are finished.',
      tr: 'Çatı eğimi, pencere şekli, balkonlar, duvarların malzemesi ve yüzeyi.',
    },
    icon: 'building',
    category: 'ARCHITECTURE',
  },
  {
    slug: { en: 'sun-and-driving-side', tr: 'gunes-ve-trafik-yonu' },
    title: { en: 'Sun and driving side', tr: 'Güneş ve trafik yönü' },
    summary: {
      en: 'Which side the traffic keeps to, and where the shadows fall. Together they halve the map before any other clue is read.',
      tr: 'Trafik hangi taraftan akıyor ve gölgeler nereye düşüyor. İkisi birlikte, başka hiçbir ipucuna bakmadan haritayı yarıya indiriyor.',
    },
    icon: 'sun',
    category: null,
  },
];

export const GUIDE_TOPICS: GuideTopicSeed[] = TOPICS.flatMap((topic, index) =>
  (['tr', 'en'] as const).map((locale) => ({
    locale,
    slug: topic.slug[locale],
    title: topic.title[locale],
    summary: topic.summary[locale],
    icon: topic.icon,
    category: topic.category,
    position: index,
  })),
);
