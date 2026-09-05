import { Injectable } from '@nestjs/common';
import type { GameMode } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import type { LeaderboardWindow, ScoredMode } from './dto.js';
import { rankRows } from './leaderboard.js';

const BOARD_SIZE = 50;
const CACHE_TTL_SECONDS = 60;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface BestRow {
  userId: string;
  name: string;
  image: string | null;
  score: number;
  correct: number;
  answered: number;
  playedAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  score: number;
  correct: number;
  answered: number;
  playedAt: string;
}

export interface Leaderboard {
  mode: ScoredMode;
  window: LeaderboardWindow;
  entries: LeaderboardEntry[];
  /** Where the viewer stands, even when they are far below the board. */
  you: { rank: number; score: number } | null;
}

/**
 * One row per player: their best run in the mode, not every run they have
 * played. A board of a single player's twenty best attempts tells nobody
 * anything.
 */
@Injectable()
export class LeaderboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getBoard(
    mode: ScoredMode,
    window: LeaderboardWindow,
    viewerId: string | null,
  ): Promise<Leaderboard> {
    const since = window === 'week' ? new Date(Date.now() - WEEK_MS) : new Date(0);
    const key = `leaderboard:${mode}:${window}`;

    const cached = await this.redis.get<LeaderboardEntry[]>(key);
    const entries = cached ?? (await this.topEntries(mode, since));
    if (!cached) await this.redis.set(key, entries, CACHE_TTL_SECONDS);

    return {
      mode,
      window,
      entries,
      you: viewerId ? await this.standing(mode, since, viewerId, entries) : null,
    };
  }

  private async topEntries(mode: ScoredMode, since: Date): Promise<LeaderboardEntry[]> {
    const rows = await this.prisma.$queryRaw<BestRow[]>`
        SELECT DISTINCT ON (r."userId")
               r."userId"    AS "userId",
               u.name        AS name,
               u.image       AS image,
               r.score       AS score,
               r.correct     AS correct,
               r.answered    AS answered,
               r."finishedAt" AS "playedAt"
        FROM "GameRun" r
        JOIN "User" u ON u.id = r."userId"
        WHERE r.mode = ${mode}::"GameMode"
          AND r."finishedAt" IS NOT NULL
          AND r."finishedAt" >= ${since}
          AND r.answered > 0
          AND u.status = 'ACTIVE'
        ORDER BY r."userId", r.score DESC, r."finishedAt" ASC
      `;

    return rankRows(rows)
      .slice(0, BOARD_SIZE)
      .map((row) => ({ ...row, playedAt: row.playedAt.toISOString() }));
  }

  /** The viewer's own line, taken from the board when they are on it. */
  private async standing(
    mode: ScoredMode,
    since: Date,
    viewerId: string,
    entries: LeaderboardEntry[],
  ) {
    const onBoard = entries.find((entry) => entry.userId === viewerId);
    if (onBoard) return { rank: onBoard.rank, score: onBoard.score };

    const best = await this.prisma.gameRun.aggregate({
      where: {
        userId: viewerId,
        mode: mode as GameMode,
        finishedAt: { not: null, gte: since },
        answered: { gt: 0 },
      },
      _max: { score: true },
    });
    const score = best._max.score;
    if (score === null) return null;

    const [{ higher }] = await this.prisma.$queryRaw<Array<{ higher: number }>>`
        SELECT COUNT(*)::int AS higher
        FROM (
          SELECT MAX(r.score) AS best
          FROM "GameRun" r
          JOIN "User" u ON u.id = r."userId"
          WHERE r.mode = ${mode}::"GameMode"
            AND r."finishedAt" IS NOT NULL
            AND r."finishedAt" >= ${since}
            AND r.answered > 0
            AND u.status = 'ACTIVE'
          GROUP BY r."userId"
        ) players
        WHERE players.best > ${score}
      `;

    return { rank: higher + 1, score };
  }
}
