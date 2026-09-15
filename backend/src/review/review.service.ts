import { Injectable } from '@nestjs/common';
import type { MetaCategory, Region } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service.js';
import { AnswersService } from './answers.service.js';
import { toCardView } from './card-view.js';
import type { SubmitAnswerDto } from './dto.js';
import { buildReviewQueue } from './queue.js';

const DEFAULT_SESSION_SIZE = 12;

export interface QueueFilter {
  category?: MetaCategory;
  region?: Region;
  deckSlug?: string;
  limit?: number;
}

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly answers: AnswersService,
  ) {}

  /**
   * One practice session: cards the player is about to forget first, then
   * metas they have never seen. The country is never sent to the client.
   */
  async getQueue(userId: string, filter: QueueFilter) {
    const limit = filter.limit ?? DEFAULT_SESSION_SIZE;
    const now = new Date();
    const metaWhere = {
      // Draft cards stay in the admin panel until someone publishes them.
      isPublished: true,
      category: filter.category,
      country: filter.region ? { region: filter.region } : undefined,
      decks: filter.deckSlug ? { some: { deck: { slug: filter.deckSlug } } } : undefined,
    };

    const [dueCards, unseenMetas, countries] = await Promise.all([
      this.prisma.reviewCard.findMany({
        where: { userId, dueAt: { lte: now }, meta: metaWhere },
        select: { metaId: true, dueAt: true },
        orderBy: { dueAt: 'asc' },
        take: limit,
      }),
      this.prisma.meta.findMany({
        where: { ...metaWhere, cards: { none: { userId } } },
        select: { id: true },
        take: limit,
      }),
      this.prisma.country.findMany(),
    ]);

    const orderedIds = buildReviewQueue({
      dueCards,
      newMetaIds: unseenMetas.map((meta) => meta.id),
      limit,
      now,
    });

    const metas = await this.prisma.meta.findMany({
      where: { id: { in: orderedIds } },
      include: { country: true },
    });
    const byId = new Map(metas.map((meta) => [meta.id, meta]));

    const cards = orderedIds.flatMap((id) => {
      const meta = byId.get(id);
      return meta ? [toCardView(meta, countries)] : [];
    });

    return { cards, generatedAt: now.toISOString() };
  }

  /** Grades one answer, reschedules the card and records it for the dashboard. */
  async submitAnswer(userId: string, dto: SubmitAnswerDto) {
    const answer = await this.answers.record(
      userId,
      dto.metaId,
      dto.guessedCountryCode,
      dto.responseMs,
    );

    return {
      correct: answer.correct,
      country: answer.country,
      explanation: answer.explanation,
      credit: answer.credit,
      nextDueAt: answer.nextDueAt,
      intervalDays: answer.intervalDays,
    };
  }
}
