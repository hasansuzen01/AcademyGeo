import { Injectable } from '@nestjs/common';

import { CREDIT_COLUMNS } from '../metas/image-credit.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { deckCover } from './deck-cover.js';

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
        // Enough of the cards to borrow a cover from when none was uploaded.
        metas: {
          orderBy: { position: 'asc' },
          select: {
            meta: {
              select: { imageUrl: true, imageSource: true, isPublished: true, ...CREDIT_COLUMNS },
            },
          },
        },
      },
    });

    return decks.map(({ _count, metas, ...deck }) => ({
      ...deck,
      cardCount: _count.metas,
      cover: deckCover(
        deck.coverImageUrl,
        metas.map((entry) => entry.meta),
      ),
    }));
  }
}
