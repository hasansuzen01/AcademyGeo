import { Injectable } from '@nestjs/common';

import { toUtcDay } from '../common/utc-day.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { STATS_CACHE_TTL_SECONDS, statsCacheKey } from './stats.cache.js';
import { calculateStreak } from './streak.js';

const ACTIVITY_WINDOW_DAYS = 30;
const MATURE_REPETITIONS = 3;

interface ConfusionRow {
  actual: string;
  guessed: string;
  count: number;
}

interface CategoryRow {
  category: string;
  total: number;
  correct: number;
}

export interface DashboardStats {
  totalReviews: number;
  correctReviews: number;
  winRate: number;
  streak: number;
  dueNow: number;
  learnedMetas: number;
  trackedMetas: number;
  confusions: Array<{ actual: string; guessed: string; count: number }>;
  categories: Array<{ category: string; total: number; winRate: number }>;
  activity: Array<{ day: string; reviews: number; correct: number }>;
}

@Injectable()
export class StatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getDashboard(userId: string): Promise<DashboardStats> {
    const cached = await this.redis.get<DashboardStats>(statsCacheKey(userId));
    if (cached) return cached;

    const since = new Date(Date.now() - ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const [
      totals,
      dueNow,
      learnedMetas,
      trackedMetas,
      activity,
      practiceDays,
      confusions,
      categories,
    ] = await Promise.all([
      this.prisma.reviewLog.groupBy({
        by: ['correct'],
        where: { userId },
        _count: { _all: true },
      }),
      this.prisma.reviewCard.count({
        where: { userId, dueAt: { lte: new Date() } },
      }),
      this.prisma.reviewCard.count({
        where: { userId, repetitions: { gte: MATURE_REPETITIONS } },
      }),
      this.prisma.reviewCard.count({ where: { userId } }),
      this.prisma.dailyActivity.findMany({
        where: { userId, day: { gte: since } },
        orderBy: { day: 'asc' },
      }),
      // The streak can run longer than the chart window, so it is counted
      // over every day the player has practised rather than the last 30.
      this.prisma.dailyActivity.findMany({
        where: { userId, reviews: { gt: 0 } },
        select: { day: true },
        orderBy: { day: 'desc' },
      }),
      this.prisma.$queryRaw<ConfusionRow[]>`
          SELECT m."countryCode" AS actual,
                 l."guessedCountryCode" AS guessed,
                 COUNT(*)::int AS count
          FROM "ReviewLog" l
          JOIN "Meta" m ON m.id = l."metaId"
          WHERE l."userId" = ${userId} AND l.correct = false
          GROUP BY 1, 2
          ORDER BY count DESC
          LIMIT 6
        `,
      this.prisma.$queryRaw<CategoryRow[]>`
          SELECT m.category::text AS category,
                 COUNT(*)::int AS total,
                 COUNT(*) FILTER (WHERE l.correct)::int AS correct
          FROM "ReviewLog" l
          JOIN "Meta" m ON m.id = l."metaId"
          WHERE l."userId" = ${userId}
          GROUP BY 1
          ORDER BY total DESC
        `,
    ]);

    const correctReviews = totals.find((row) => row.correct)?._count._all ?? 0;
    const totalReviews = totals.reduce((sum, row) => sum + row._count._all, 0);

    const stats: DashboardStats = {
      totalReviews,
      correctReviews,
      winRate: totalReviews === 0 ? 0 : Math.round((correctReviews / totalReviews) * 100),
      streak: calculateStreak(
        practiceDays.map((entry) => toUtcDay(entry.day)),
        new Date(),
      ),
      dueNow,
      learnedMetas,
      trackedMetas,
      confusions,
      categories: categories.map((row) => ({
        category: row.category,
        total: row.total,
        winRate: row.total === 0 ? 0 : Math.round((row.correct / row.total) * 100),
      })),
      activity: activity.map((day) => ({
        day: toUtcDay(day.day),
        reviews: day.reviews,
        correct: day.correct,
      })),
    };

    await this.redis.set(statsCacheKey(userId), stats, STATS_CACHE_TTL_SECONDS);

    return stats;
  }
}
