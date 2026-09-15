import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CREDIT_COLUMNS, withCredit } from './image-credit.js';

@Injectable()
export class MetasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Country names for the answer buttons and the dashboard. Metas themselves
   * are never listed: a meta row carries the country it belongs to, so an open
   * listing would hand out the answer to every card in the deck.
   */
  listCountries() {
    return this.prisma.country.findMany({ orderBy: { nameEn: 'asc' } });
  }

  /**
   * A few card pictures for the landing page. Only the picture: the country
   * stays server-side like everywhere else, and the filenames are opaque, so
   * the strip cannot be read as an answer key either. Each photograph carries
   * its credit, since none of them is being asked about here.
   */
  async getShowcase(take: number) {
    const cards = await this.prisma.meta.findMany({
      where: { isPublished: true },
      select: { id: true, imageUrl: true, imageSource: true, ...CREDIT_COLUMNS },
      orderBy: { slug: 'asc' },
      take,
    });

    return cards.map(withCredit);
  }

  /** Deck size for the landing page, so the numbers there are never stale. */
  async getCatalogueSummary() {
    const [countries, cards, categories] = await Promise.all([
      this.prisma.country.count(),
      this.prisma.meta.count({ where: { isPublished: true } }),
      this.prisma.meta.findMany({
        where: { isPublished: true },
        distinct: ['category'],
        select: { category: true },
      }),
    ]);

    return { countries, cards, clueTypes: categories.length };
  }
}
