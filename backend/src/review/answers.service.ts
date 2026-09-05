import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { startOfUtcDay } from '../common/utc-day.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { statsCacheKey } from '../stats/stats.cache.js';
import { INITIAL_REVIEW_STATE, gradeAnswer, scheduleNextReview } from './srs.js';

export interface RecordedAnswer {
  correct: boolean;
  difficulty: number;
  country: { code: string; nameEn: string; nameTr: string };
  explanation: {
    titleEn: string;
    titleTr: string;
    descriptionEn: string;
    descriptionTr: string;
  };
  nextDueAt: string;
  intervalDays: number;
}

/**
 * Every answer in the app lands here, whatever mode it was given in: the
 * spaced-repetition card is rescheduled, the answer is logged, and the day's
 * activity is counted. Modes differ in how they score, never in what they
 * remember.
 */
@Injectable()
export class AnswersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async record(
    userId: string,
    metaId: string,
    guessedCountryCode: string,
    responseMs: number,
  ): Promise<RecordedAnswer> {
    const meta = await this.prisma.meta.findUnique({
      where: { id: metaId },
      include: { country: true },
    });
    if (!meta) throw new NotFoundException('Meta not found');

    const guessed = guessedCountryCode.toUpperCase();

    // Only real countries are recorded. Without this a client could post any
    // two letters and fill the confusion chart with codes nobody can read.
    const known = await this.prisma.country.findUnique({ where: { code: guessed } });
    if (!known) throw new BadRequestException('Unknown country code');

    const card = await this.prisma.reviewCard.findUnique({
      where: { userId_metaId: { userId, metaId: meta.id } },
    });

    const correct = meta.countryCode === guessed;
    const outcome = { correct, responseMs };
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
          responseMs,
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
      difficulty: meta.difficulty,
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
