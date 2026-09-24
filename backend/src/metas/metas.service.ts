import { Injectable } from '@nestjs/common';

import { toUtcDay } from '../common/utc-day.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { type DemoCard, pickDemoCards } from './demo-cards.js';
import { CREDIT_COLUMNS, withCredit } from './image-credit.js';

@Injectable()
export class MetasService {
  /**
   * Today's demo hand, dealt once per UTC day. Holding it also keeps the hand
   * fixed when a card is published mid-day, which would otherwise reshuffle it
   * and give away a second hand.
   */
  private demoHand: { day: string; cards: Promise<DemoCard[]> } | null = null;

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

  /** Today's real photographed cards, each with its answer, for the landing page's live demo. */
  getDemoCards(count: number): Promise<DemoCard[]> {
    const day = toUtcDay(new Date());
    if (this.demoHand?.day !== day) {
      const cards = this.dealDemoCards(count, day);
      // A failed read is not worth holding for the rest of the day.
      cards.catch(() => {
        if (this.demoHand?.cards === cards) this.demoHand = null;
      });
      this.demoHand = { day, cards };
    }

    return this.demoHand.cards;
  }

  private async dealDemoCards(count: number, day: string): Promise<DemoCard[]> {
    const [cards, countries] = await Promise.all([
      this.prisma.meta.findMany({
        where: { isPublished: true, imageSource: 'PHOTO', imageUrl: { not: '' } },
        select: {
          id: true,
          imageUrl: true,
          imageSource: true,
          titleEn: true,
          titleTr: true,
          countryCode: true,
          ...CREDIT_COLUMNS,
        },
      }),
      this.prisma.country.findMany({
        select: { code: true, nameEn: true, nameTr: true, region: true },
        orderBy: { code: 'asc' },
      }),
    ]);

    return pickDemoCards(cards, countries, count, day);
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
