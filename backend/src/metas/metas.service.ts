import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

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
