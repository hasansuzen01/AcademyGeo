import { Injectable } from '@nestjs/common';

import { toUtcDay } from '../common/utc-day.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { calculateStreak } from '../stats/streak.js';
import { type ProgressSnapshot, achievementProgress, newlyUnlocked } from './achievements.js';
import { describeLevel, xpForAnswer } from './levels.js';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  /** Adds what one answer was worth and returns the experience gained. */
  async awardForAnswer(userId: string, answer: { correct: boolean; difficulty: number }) {
    const gained = xpForAnswer(answer);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: gained } },
      select: { xp: true },
    });

    return { gained, xp: user.xp, level: describeLevel(user.xp).level };
  }

  /** Everything the badges are measured against, counted fresh. */
  async snapshot(userId: string): Promise<ProgressSnapshot> {
    const [user, totals, practiceDays, runs, perfectDailies, countries] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { xp: true } }),
      this.prisma.reviewLog.groupBy({
        by: ['correct'],
        where: { userId },
        _count: { _all: true },
      }),
      this.prisma.dailyActivity.findMany({
        where: { userId, reviews: { gt: 0 } },
        select: { day: true },
        orderBy: { day: 'desc' },
      }),
      this.prisma.gameRun.aggregate({
        where: { userId, finishedAt: { not: null } },
        _max: { score: true, bestStreak: true },
      }),
      this.prisma.$queryRaw<Array<{ count: number }>>`
          SELECT COUNT(*)::int AS count
          FROM "GameRun"
          WHERE "userId" = ${userId}
            AND mode = 'DAILY'
            AND "finishedAt" IS NOT NULL
            AND answered > 0
            AND correct = answered
        `,
      this.prisma.$queryRaw<Array<{ count: number }>>`
          SELECT COUNT(DISTINCT m."countryCode")::int AS count
          FROM "ReviewLog" l
          JOIN "Meta" m ON m.id = l."metaId"
          WHERE l."userId" = ${userId} AND l.correct = true
        `,
    ]);

    const correctReviews = totals.find((row) => row.correct)?._count._all ?? 0;

    return {
      totalReviews: totals.reduce((sum, row) => sum + row._count._all, 0),
      correctReviews,
      dayStreak: calculateStreak(
        practiceDays.map((entry) => toUtcDay(entry.day)),
        new Date(),
      ),
      level: describeLevel(user.xp).level,
      bestRunScore: runs._max.score ?? 0,
      bestAnswerStreak: runs._max.bestStreak ?? 0,
      perfectDailies: perfectDailies[0]?.count ?? 0,
      countriesAnswered: countries[0]?.count ?? 0,
    };
  }

  /**
   * Writes down any badge the player has just earned and hands back the codes,
   * so the run summary can celebrate them.
   */
  async syncAchievements(userId: string): Promise<string[]> {
    const [snapshot, held] = await Promise.all([
      this.snapshot(userId),
      this.prisma.userAchievement.findMany({ where: { userId }, select: { code: true } }),
    ]);

    const unlocked = newlyUnlocked(
      snapshot,
      held.map((entry) => entry.code),
    );
    if (unlocked.length === 0) return [];

    await this.prisma.userAchievement.createMany({
      data: unlocked.map((code) => ({ userId, code })),
      skipDuplicates: true,
    });

    return unlocked;
  }

  /** The trophy wall: level, experience, and every badge with its progress. */
  async getProgress(userId: string) {
    const [user, snapshot, held] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { xp: true } }),
      this.snapshot(userId),
      this.prisma.userAchievement.findMany({
        where: { userId },
        select: { code: true, unlockedAt: true },
      }),
    ]);

    const unlockedAt = new Map(held.map((entry) => [entry.code, entry.unlockedAt]));

    return {
      ...describeLevel(user.xp),
      snapshot,
      achievements: achievementProgress(
        snapshot,
        held.map((entry) => entry.code),
      ).map((achievement) => ({
        ...achievement,
        unlockedAt: unlockedAt.get(achievement.code)?.toISOString() ?? null,
      })),
    };
  }
}
