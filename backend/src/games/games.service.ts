import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { GameRun } from '@prisma/client';

import { toUtcDay } from '../common/utc-day.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProgressService } from '../progress/progress.service.js';
import { AnswersService } from '../review/answers.service.js';
import { type CardView, toCardView } from '../review/card-view.js';
import { pickDailyMetaIds } from './daily.js';
import type { ScoredMode, StartRunDto } from './dto.js';
import { pickDrillMetaIds } from './drill.js';
import { rulesFor } from './modes.js';
import { type RunState, advanceRun } from './run.js';

/** How deep a hand the open-ended modes are dealt before the clock or the
 *  player's lives end them. */
const OPEN_HAND_SIZE = 60;
/** How many countries the drill looks at when it picks a player's weak spots. */
const WEAKNESS_SAMPLE = 60;

/** What the player is told about the card they just answered. */
export interface GradedAnswer {
  correct: boolean;
  country: { code: string; nameEn: string; nameTr: string };
  explanation: {
    titleEn: string;
    titleTr: string;
    descriptionEn: string;
    descriptionTr: string;
  };
  points: number;
  xpGained: number;
  /** Badge codes the answer just earned, for the summary to celebrate. */
  unlocked: string[];
}

export interface AnswerView {
  /**
   * Null when the run ended before the answer could count: the clock ran out,
   * or the hand was already empty. The client goes straight to the summary.
   */
  graded: GradedAnswer | null;
  finished: boolean;
  run: RunView;
}

export interface RunView {
  runId: string;
  mode: ScoredMode;
  answered: number;
  correct: number;
  /** How many cards the run was dealt, or null when it runs on the clock. */
  total: number | null;
  score: number;
  bestStreak: number;
  durationMs: number;
  streak: number;
  livesLeft: number | null;
  /** The collection the hand came from, when it came from one. */
  deckSlug: string | null;
  /** When the clock stops, for a timed run. */
  endsAt: string | null;
  card: CardView | null;
  finished: boolean;
}

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly answers: AnswersService,
    private readonly progress: ProgressService,
  ) {}

  /** Deals a hand and puts the first card up. */
  async start(userId: string, dto: StartRunDto): Promise<RunView> {
    const day = dto.mode === 'DAILY' ? toUtcDay(new Date()) : null;

    // There is only one attempt a day, so a half-played challenge is picked
    // back up rather than counted as the attempt.
    if (day) {
      const today = await this.prisma.gameRun.findFirst({
        where: { userId, mode: 'DAILY', day },
      });
      if (today?.finishedAt) {
        throw new BadRequestException('The daily challenge has already been played today');
      }
      if (today) return this.view(today);
    }

    // Otherwise one run at a time. Walking away banks whatever the run had
    // rather than leaving a half-played row nobody can ever finish.
    await this.abandonActive(userId);

    const metaIds = await this.dealHand(userId, dto);
    if (metaIds.length === 0) {
      throw new BadRequestException('No cards are published for that filter yet');
    }

    const run = await this.prisma.gameRun.create({
      data: { userId, mode: dto.mode, metaIds, day, deckId: await this.deckIdFor(dto) },
    });

    return this.view(run);
  }

  /** The run the player walked away from, so a refresh does not lose it. */
  async active(userId: string): Promise<RunView | null> {
    const run = await this.prisma.gameRun.findFirst({
      where: { userId, finishedAt: null },
      orderBy: { startedAt: 'desc' },
    });
    if (!run) return null;

    // A run the player can no longer add to is over, however it got that way.
    if (this.isSpent(run)) return this.view(await this.finish(run));

    return this.view(run);
  }

  /** Grades the card on screen, scores it, and deals the next one. */
  async answer(
    userId: string,
    runId: string,
    guessedCountryCode: string,
    reportedMs: number,
  ): Promise<AnswerView> {
    const run = await this.prisma.gameRun.findFirst({ where: { id: runId, userId } });
    if (!run) throw new NotFoundException('Run not found');
    if (run.finishedAt) throw new BadRequestException('That run is already over');

    const metaId = run.metaIds[run.cursor];
    // The clock beating the answer, or an empty hand, ends the run without
    // counting the card that was on screen.
    if (!metaId || this.isSpent(run)) {
      return { graded: null, finished: true, run: await this.view(await this.finish(run)) };
    }

    const now = new Date();
    const recorded = await this.answers.record(userId, metaId, guessedCountryCode, reportedMs);

    // The client's stopwatch is only believed up to the time that has actually
    // passed since the card was handed out.
    const elapsedMs = Math.min(reportedMs, now.getTime() - run.servedAt.getTime());

    const next = advanceRun(
      toRunState(run),
      { correct: recorded.correct, responseMs: elapsedMs, difficulty: recorded.difficulty },
      now,
    );

    const saved = await this.prisma.gameRun.update({
      where: { id: run.id },
      data: {
        cursor: { increment: 1 },
        answered: next.answered,
        correct: next.correct,
        score: next.score,
        streak: next.streak,
        bestStreak: next.bestStreak,
        servedAt: now,
        ...(next.endedFor
          ? { finishedAt: now, durationMs: now.getTime() - run.startedAt.getTime() }
          : {}),
      },
    });

    const xp = await this.progress.awardForAnswer(userId, {
      correct: recorded.correct,
      difficulty: recorded.difficulty,
    });
    const unlocked = next.endedFor ? await this.progress.syncAchievements(userId) : [];

    return {
      graded: {
        correct: recorded.correct,
        country: recorded.country,
        explanation: recorded.explanation,
        points: next.score - run.score,
        xpGained: xp.gained,
        unlocked,
      },
      finished: Boolean(next.endedFor),
      run: await this.view(saved),
    };
  }

  /** Recent runs for the profile page. */
  history(userId: string, take: number) {
    return this.prisma.gameRun.findMany({
      where: { userId, finishedAt: { not: null } },
      orderBy: { finishedAt: 'desc' },
      take,
      select: {
        id: true,
        mode: true,
        score: true,
        correct: true,
        answered: true,
        bestStreak: true,
        durationMs: true,
        finishedAt: true,
      },
    });
  }

  /** Whether today's challenge is still waiting, and how it went if not. */
  async dailyStatus(userId: string) {
    const day = toUtcDay(new Date());
    const run = await this.prisma.gameRun.findFirst({
      where: { userId, mode: 'DAILY', day },
    });

    return {
      day,
      played: Boolean(run?.finishedAt),
      inProgress: Boolean(run && !run.finishedAt),
      score: run?.score ?? null,
      correct: run?.correct ?? null,
      answered: run?.answered ?? null,
      total: run?.metaIds.length ?? rulesFor('DAILY').cardCount,
    };
  }

  // -- internals ------------------------------------------------------------

  private async view(run: GameRun): Promise<RunView> {
    const rules = rulesFor(run.mode);
    const finished = Boolean(run.finishedAt);
    const metaId = run.metaIds[run.cursor];
    const deck = run.deckId
      ? await this.prisma.deck.findUnique({
          where: { id: run.deckId },
          select: { slug: true },
        })
      : null;

    return {
      runId: run.id,
      mode: run.mode as ScoredMode,
      answered: run.answered,
      correct: run.correct,
      total: rules.cardCount === null ? null : run.metaIds.length,
      score: run.score,
      bestStreak: run.bestStreak,
      durationMs: run.finishedAt
        ? run.durationMs
        : Date.now() - run.startedAt.getTime(),
      streak: run.streak,
      livesLeft: rules.lives === null ? null : rules.lives - (run.answered - run.correct),
      deckSlug: deck?.slug ?? null,
      endsAt:
        rules.timeLimitMs === null
          ? null
          : new Date(run.startedAt.getTime() + rules.timeLimitMs).toISOString(),
      card: finished || !metaId ? null : await this.cardFor(metaId),
      finished,
    };
  }

  private async cardFor(metaId: string): Promise<CardView | null> {
    const [meta, countries] = await Promise.all([
      this.prisma.meta.findUnique({ where: { id: metaId }, include: { country: true } }),
      this.prisma.country.findMany(),
    ]);

    return meta ? toCardView(meta, countries) : null;
  }

  /** Whether the run can still take an answer, whatever it was left doing. */
  private isSpent(run: GameRun): boolean {
    const limit = rulesFor(run.mode).timeLimitMs;
    if (limit !== null && Date.now() - run.startedAt.getTime() >= limit) return true;

    // Yesterday's challenge is not today's, so an abandoned one is closed
    // rather than resumed into the wrong day's hand.
    return run.mode === 'DAILY' && run.day !== toUtcDay(new Date());
  }

  private async finish(run: GameRun): Promise<GameRun> {
    const finished = await this.prisma.gameRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        durationMs: Date.now() - run.startedAt.getTime(),
      },
    });

    await this.progress.syncAchievements(run.userId);

    return finished;
  }

  /**
   * Closes the run the player walked away from. Today's daily challenge is
   * left alone: it is the one attempt they get, and starting a rush should not
   * spend it.
   */
  private async abandonActive(userId: string): Promise<void> {
    const active = await this.prisma.gameRun.findFirst({
      where: { userId, finishedAt: null, NOT: { mode: 'DAILY', day: toUtcDay(new Date()) } },
    });
    if (active) await this.finish(active);
  }

  /** Which cards the run is dealt, and in what order. */
  private async dealHand(userId: string, dto: StartRunDto): Promise<string[]> {
    // The daily challenge is the same for everyone, so it ignores the filters.
    const narrowed = dto.mode !== 'DAILY';
    const where = {
      isPublished: true,
      category: narrowed ? dto.category : undefined,
      country: narrowed && dto.region ? { region: dto.region } : undefined,
      decks:
        narrowed && dto.deckSlug ? { some: { deck: { slug: dto.deckSlug } } } : undefined,
    };

    if (dto.mode === 'DAILY') {
      const metas = await this.prisma.meta.findMany({ where, select: { id: true } });
      return pickDailyMetaIds(
        metas.map((meta) => meta.id),
        toUtcDay(new Date()),
        rulesFor('DAILY').cardCount ?? 10,
      );
    }

    if (dto.mode === 'DRILL') {
      const [metas, countryMisses] = await Promise.all([
        this.prisma.meta.findMany({
          where,
          select: { id: true, countryCode: true, category: true },
        }),
        this.countryMisses(userId),
      ]);

      return pickDrillMetaIds(metas, { countryMisses }, rulesFor('DRILL').cardCount ?? 15);
    }

    // Survival ramps: the easy cards go first, so the run gets harder as the
    // player's remaining lives get more expensive.
    const metas = await this.prisma.meta.findMany({
      where,
      select: { id: true },
      orderBy: dto.mode === 'SURVIVAL' ? { difficulty: 'asc' } : undefined,
      take: OPEN_HAND_SIZE,
    });
    const ids = metas.map((meta) => meta.id);

    return dto.mode === 'SURVIVAL' ? ids : shuffle(ids);
  }

  /** The collection a run was started from, when it was started from one. */
  private async deckIdFor(dto: StartRunDto): Promise<string | null> {
    if (dto.mode === 'DAILY' || !dto.deckSlug) return null;

    const deck = await this.prisma.deck.findUnique({
      where: { slug: dto.deckSlug },
      select: { id: true },
    });

    return deck?.id ?? null;
  }

  /** Wrong answers per country the player should have named. */
  private async countryMisses(userId: string): Promise<Record<string, number>> {
    const rows = await this.prisma.$queryRaw<Array<{ code: string; misses: number }>>`
        SELECT m."countryCode" AS code, COUNT(*)::int AS misses
        FROM "ReviewLog" l
        JOIN "Meta" m ON m.id = l."metaId"
        WHERE l."userId" = ${userId} AND l.correct = false
        GROUP BY 1
        ORDER BY misses DESC
        LIMIT ${WEAKNESS_SAMPLE}
      `;

    return Object.fromEntries(rows.map((row) => [row.code, row.misses]));
  }
}

/** The run as the pure rules see it, before this answer is folded in. */
function toRunState(run: GameRun): RunState {
  return {
    mode: run.mode,
    dealt: run.metaIds.length,
    answered: run.answered,
    correct: run.correct,
    score: run.score,
    streak: run.streak,
    bestStreak: run.bestStreak,
    startedAt: run.startedAt.getTime(),
    endedFor: null,
  };
}

function shuffle(items: string[]): string[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
