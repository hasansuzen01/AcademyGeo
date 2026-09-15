import type { Country, Meta } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { toCardView } from './card-view.js';

const countries = [
  { code: 'NO', nameEn: 'Norway', nameTr: 'Norveç' },
  { code: 'SE', nameEn: 'Sweden', nameTr: 'İsveç' },
  { code: 'FI', nameEn: 'Finland', nameTr: 'Finlandiya' },
  { code: 'DK', nameEn: 'Denmark', nameTr: 'Danimarka' },
] as Country[];

const photographed = {
  id: 'meta-1',
  slug: 'no-road',
  countryCode: 'NO',
  category: 'ROAD_LINE',
  imageUrl: 'https://media.example/metas/3f9a.jpg',
  imageSource: 'PHOTO',
  imageAuthor: 'Jane Roe',
  imageLicense: 'CC BY-SA 4.0',
  imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Yellow_centre_line_near_Bergen.jpg',
  difficulty: 2,
  country: countries[0],
} as unknown as Meta & { country: Country };

describe('toCardView', () => {
  // A credit is often the most specific text about a photograph: the author's
  // caption or the file name can name the town. Sent with the question, it
  // would hand the answer to anyone who opened the network tab.
  it('never sends the photo credit with the question', () => {
    const sent = JSON.stringify(
      toCardView(photographed, countries, { choiceCodes: ['NO', 'SE', 'FI', 'DK'] }),
    );

    expect(sent).not.toContain('Jane Roe');
    expect(sent).not.toContain('CC BY-SA');
    expect(sent).not.toContain('commons.wikimedia.org');
    expect(sent).not.toContain('Bergen');
  });

  it('still sends the picture and the answers to choose from', () => {
    const view = toCardView(photographed, countries, { choiceCodes: ['NO', 'SE', 'FI', 'DK'] });

    expect(view.imageUrl).toBe('https://media.example/metas/3f9a.jpg');
    expect(view.choices.map((choice) => choice.code).sort()).toEqual(['DK', 'FI', 'NO', 'SE']);
  });
});
