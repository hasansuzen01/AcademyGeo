import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { MetaCategory, Region } from '@prisma/client';

import { startOfUtcDay } from '../common/utc-day.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { statsCacheKey } from '../stats/stats.cache.js';
import { buildChoices } from './choices.js';
import type { SubmitAnswerDto } from './dto.js';
import { buildReviewQueue } from './queue.js';
import { INITIAL_REVIEW_STATE, gradeAnswer, scheduleNextReview } from './srs.js';

const DEFAULT_SESSION_SIZE = 12;
const CHOICES_PER_CARD = 4;

export interface QueueFilter {
  category?: MetaCategory;
  region?: Region;
  limit?: number;
}

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
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
    const byCode = new Map(countries.map((country) => [country.code, country]));

    const cards = orderedIds.flatMap((id) => {
      const meta = byId.get(id);
      if (!meta) return [];

      const choiceCodes = buildChoices(meta.country, countries, CHOICES_PER_CARD);

      return [
        {
          metaId: meta.id,
          category: meta.category,
          imageUrl: meta.imageUrl,
          imageSource: meta.imageSource,
          difficulty: meta.difficulty,
          choices: choiceCodes.flatMap((code) => {
            const country = byCode.get(code);
            return country
              ? [
                  {
                    code: country.code,
                    nameEn: country.nameEn,
                    nameTr: country.nameTr,
                  },
                ]
              : [];
          }),
        },
      ];
    });

    return { cards, generatedAt: now.toISOString() };
  }

  /** Grades one answer, reschedules the card and records it for the dashboard. */
  async submitAnswer(userId: string, dto: SubmitAnswerDto) {
    const meta = await this.prisma.meta.findUnique({
      where: { id: dto.metaId },
      include: { country: true },
    });
    if (!meta) throw new NotFoundException('Meta not found');

    const card = await this.prisma.reviewCard.findUnique({
      where: { userId_metaId: { userId, metaId: meta.id } },
    });

    const guessed = dto.guessedCountryCode.toUpperCase();

    // Only real countries are recorded. Without this a client could post any
    // two letters and fill the confusion chart with codes nobody can read.
    const known = await this.prisma.country.findUnique({ where: { code: guessed } });
    if (!known) throw new BadRequestException('Unknown country code');

    const correct = meta.countryCode === guessed;
    const outcome = { correct, responseMs: dto.responseMs };
    const now = new Date();
    const next = scheduleNextReview(card ?? INITIAL_REVIEW_STATE, outcome, now);
    const scheduling = {
      repetitions: next.repetitions,
      intervalDays: next.intervalDays,
      easeFactor: next.easeFactor,
      lapses: next.lapses,
      dueAt: next.dueAt,
      lastReviewedAt: now,
    };

    await this.prisma.$transaction([
      this.prisma.reviewCard.upsert({
        where: { userId_metaId: { userId, metaId: meta.id } },
        create: { userId, metaId: meta.id, ...scheduling },
        update: scheduling,
      }),
      this.prisma.reviewLog.create({
        data: {
          userId,
          metaId: meta.id,
          guessedCountryCode: guessed,
          correct,
          responseMs: dto.responseMs,
          grade: gradeAnswer(outcome),
        },
      }),
      this.prisma.dailyActivity.upsert({
        where: { userId_day: { userId, day: startOfUtcDay(now) } },
        create: {
          userId,
          day: startOfUtcDay(now),
          reviews: 1,
          correct: correct ? 1 : 0,
        },
        update: {
          reviews: { increment: 1 },
          correct: { increment: correct ? 1 : 0 },
        },
      }),
    ]);

    await this.redis.invalidate(statsCacheKey(userId));

    return {
      correct,
      country: {
        code: meta.country.code,
        nameEn: meta.country.nameEn,
        nameTr: meta.country.nameTr,
      },
      explanation: {
        titleEn: meta.titleEn,
        titleTr: meta.titleTr,
        descriptionEn: meta.descriptionEn,
        descriptionTr: meta.descriptionTr,
      },
      nextDueAt: next.dueAt.toISOString(),
      intervalDays: next.intervalDays,
    };
  }
}
