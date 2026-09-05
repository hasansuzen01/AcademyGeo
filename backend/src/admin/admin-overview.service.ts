import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

export interface HardestMetaRow {
  id: string;
  slug: string;
  countryCode: string;
  category: string;
  answers: number;
  correct: number;
}

export interface DayRow {
  day: string;
  reviews: number;
  players: number;
}

const HARDEST_MIN_ANSWERS = 5;
const ACTIVITY_DAYS = 30;

/** The numbers the admin landing page is built from. */
@Injectable()
export class AdminOverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      metas,
      publishedMetas,
      illustratedMetas,
      countries,
      decks,
      users,
      admins,
      answers,
      activeToday,
      hardest,
      activity,
    ] = await Promise.all([
      this.prisma.meta.count(),
      this.prisma.meta.count({ where: { isPublished: true } }),
      // Cards still showing a seeded diagram, waiting for a real photograph.
      this.prisma.meta.count({ where: { imageSource: 'ILLUSTRATION' } }),
      this.prisma.country.count(),
      this.prisma.deck.count(),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.reviewLog.count(),
      this.prisma.dailyActivity.count({ where: { day: startOfUtcToday() } }),
      this.prisma.$queryRaw<HardestMetaRow[]>`
        SELECT m.id,
               m.slug,
               m."countryCode",
               m.category::text AS category,
               COUNT(*)::int AS answers,
               COUNT(*) FILTER (WHERE l.correct)::int AS correct
        FROM "ReviewLog" l
        JOIN "Meta" m ON m.id = l."metaId"
        GROUP BY m.id, m.slug, m."countryCode", m.category
        HAVING COUNT(*) >= ${HARDEST_MIN_ANSWERS}
        ORDER BY (COUNT(*) FILTER (WHERE l.correct))::float / COUNT(*) ASC
        LIMIT 8
      `,
      this.prisma.$queryRaw<DayRow[]>`
        SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
               SUM(d.reviews)::int AS reviews,
               COUNT(DISTINCT d."userId")::int AS players
        FROM "DailyActivity" d
        WHERE d.day >= CURRENT_DATE - ${ACTIVITY_DAYS}::int
        GROUP BY d.day
        ORDER BY d.day ASC
      `,
    ]);

    return {
      counts: {
        metas,
        publishedMetas,
        draftMetas: metas - publishedMetas,
        illustratedMetas,
        countries,
        decks,
        users,
        admins,
        answers,
        activeToday,
      },
      hardestMetas: hardest.map((row) => ({
        id: row.id,
        slug: row.slug,
        countryCode: row.countryCode,
        category: row.category,
        answers: row.answers,
        winRate: Math.round((row.correct / row.answers) * 100),
      })),
      activity,
    };
  }
}

function startOfUtcToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
