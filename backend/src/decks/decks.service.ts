import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

/**
 * Collections as a player sees them. A deck is a themed run through part of
 * the catalogue, and an event deck only exists inside its window.
 */
@Injectable()
export class DecksService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const now = new Date();

    const decks = await this.prisma.deck.findMany({
      where: {
        isPublished: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: { nameEn: 'asc' },
      select: {
        slug: true,
        nameEn: true,
        nameTr: true,
        descriptionEn: true,
        descriptionTr: true,
        coverImageUrl: true,
        endsAt: true,
        _count: { select: { metas: true } },
      },
    });

    return decks.map(({ _count, ...deck }) => ({ ...deck, cardCount: _count.metas }));
  }
}
