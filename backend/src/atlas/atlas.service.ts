import { Injectable, NotFoundException } from '@nestjs/common';

import { CREDIT_COLUMNS, withCredit } from '../metas/image-credit.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { groupClues } from './group-clues.js';

/**
 * The reference half of the site. A player who keeps missing Norway can read
 * up on it here rather than waiting for the card to come round again, so the
 * same pictures serve both the quiz and the study.
 */
@Injectable()
export class AtlasService {
  constructor(private readonly prisma: PrismaService) {}

  /** Every country with something to show, and how much of it there is. */
  async listCountries() {
    const countries = await this.prisma.country.findMany({
      orderBy: { nameEn: 'asc' },
      select: {
        code: true,
        nameEn: true,
        nameTr: true,
        region: true,
        flagEmoji: true,
        drivingSide: true,
        summaryEn: true,
        summaryTr: true,
        _count: { select: { metas: { where: { isPublished: true } } } },
      },
    });

    return countries.map(({ _count, ...country }) => ({
      ...country,
      clueCount: _count.metas,
    }));
  }

  /** One country: its facts, and every published clue grouped for reading. */
  async getCountry(code: string) {
    const country = await this.prisma.country.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        metas: {
          where: { isPublished: true },
          orderBy: [{ difficulty: 'asc' }, { titleEn: 'asc' }],
          select: {
            id: true,
            slug: true,
            category: true,
            titleEn: true,
            titleTr: true,
            descriptionEn: true,
            descriptionTr: true,
            imageUrl: true,
            imageSource: true,
            ...CREDIT_COLUMNS,
            difficulty: true,
          },
        },
      },
    });
    if (!country) throw new NotFoundException('Country not found');

    const { metas, ...facts } = country;

    // The atlas already names the country, so the credit gives nothing away here.
    const clues = metas.map(withCredit);

    return {
      ...facts,
      languages: splitList(country.languages),
      cameraGens: splitList(country.cameraGens),
      clueCount: clues.length,
      groups: groupClues(clues),
    };
  }
}

/** Comma-separated admin input, cleaned up for the client. */
function splitList(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}
