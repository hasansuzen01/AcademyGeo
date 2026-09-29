import { Injectable } from '@nestjs/common';
import type { MetaCategory, Region } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service.js';
import { AnswersService } from './answers.service.js';
import { toCardView } from './card-view.js';
import type { CheckAnswerDto, SubmitAnswerDto } from './dto.js';
import { dealPracticeCards } from './queue.js';

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
   * One practice session: a random dozen of the published cards that match,
   * dealt fresh every time, like a quiz. The country is never sent to the client.
   */
  async getQueue(filter: QueueFilter) {
    const [matching, countries] = await Promise.all([
      this.prisma.meta.findMany({
        where: {
          // Draft cards stay in the admin panel until someone publishes them.
          isPublished: true,
          category: filter.category,
          country: filter.region ? { region: filter.region } : undefined,
          decks: filter.deckSlug ? { some: { deck: { slug: filter.deckSlug } } } : undefined,
        },
        select: { id: true },
      }),
      this.prisma.country.findMany(),
    ]);

    const dealtIds = dealPracticeCards(
      matching.map((meta) => meta.id),
      filter.limit ?? DEFAULT_SESSION_SIZE,
    );

    const metas = await this.prisma.meta.findMany({
      where: { id: { in: dealtIds } },
      include: { country: true },
    });
    const byId = new Map(metas.map((meta) => [meta.id, meta]));

    const cards = dealtIds.flatMap((id) => {
      const meta = byId.get(id);
      return meta ? [toCardView(meta, countries)] : [];
    });

    return { cards };
  }

  /** Grades a guess from someone who is not signed in. Nothing is recorded. */
  checkAnswer(dto: CheckAnswerDto) {
    return this.answers.check(dto.metaId, dto.guessedCountryCode);
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
