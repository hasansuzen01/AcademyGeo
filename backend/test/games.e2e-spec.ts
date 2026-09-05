import 'dotenv/config';

import { ConfigModule } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AuthModule } from '../src/auth/auth.module.js';
import { GamesModule } from '../src/games/games.module.js';
import { GamesService } from '../src/games/games.service.js';
import { scoreAnswer } from '../src/games/scoring.js';
import { LeaderboardService } from '../src/games/leaderboard.service.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { ProgressService } from '../src/progress/progress.service.js';
import { RedisModule } from '../src/redis/redis.module.js';

/**
 * The whole run loop against a real database: dealing a hand, grading an
 * answer, and the rules that end a run. The pure pieces are covered by their
 * own tests; what this checks is that they are wired to the right rows.
 *
 * Needs Postgres and Redis up, which `docker compose up -d postgres redis`
 * gives you, and a seeded deck.
 */
describe('Scored runs', () => {
  let moduleRef: TestingModule;
  let games: GamesService;
  let progress: ProgressService;
  let leaderboard: LeaderboardService;
  let prisma: PrismaService;
  let userId: string;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        RedisModule,
        // The controllers guard on a session, so their guard needs the auth
        // instance even though the test calls the services directly.
        AuthModule,
        GamesModule,
      ],
    }).compile();
    await moduleRef.init();

    games = moduleRef.get(GamesService);
    progress = moduleRef.get(ProgressService);
    leaderboard = moduleRef.get(LeaderboardService);
    prisma = moduleRef.get(PrismaService);

    const user = await prisma.user.create({
      data: { name: 'Run tester', email: `run-${Date.now()}@example.test` },
    });
    userId = user.id;
  });

  afterAll(async () => {
    if (userId) await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    await moduleRef.close();
  });

  /** The answer to the card on screen, which the client is never told. */
  async function answerFor(metaId: string): Promise<string> {
    const meta = await prisma.meta.findUniqueOrThrow({ where: { id: metaId } });
    return meta.countryCode;
  }

  async function wrongAnswerFor(metaId: string): Promise<string> {
    const correct = await answerFor(metaId);
    const other = await prisma.country.findFirst({ where: { code: { not: correct } } });
    return other!.code;
  }

  it('deals a card whose answer is only ever one of the choices', async () => {
    const run = await games.start(userId, { mode: 'RUSH' });
    const answer = await answerFor(run.card!.metaId);

    expect(run.card).not.toBeNull();
    expect(run.card!.choices.map((choice) => choice.code)).toContain(answer);

    // Not in the picture's address either: a readable filename would hand the
    // answer to anyone with the network tab open.
    expect(run.card!.imageUrl.toUpperCase()).not.toContain(answer);
  });

  it('scores a correct answer and deals the next card', async () => {
    const run = await games.start(userId, { mode: 'RUSH' });
    const first = run.card!.metaId;

    const graded = await games.answer(userId, run.runId, await answerFor(first), 1_500);

    expect(graded.graded?.correct).toBe(true);
    expect(graded.graded!.points).toBeGreaterThan(0);
    expect(graded.run.score).toBe(graded.graded!.points);
    expect(graded.run.card?.metaId).not.toBe(first);
  });

  it('pays nothing for a wrong answer and resets the streak', async () => {
    const run = await games.start(userId, { mode: 'RUSH' });

    await games.answer(userId, run.runId, await answerFor(run.card!.metaId), 1_000);
    const before = await games.active(userId);
    expect(before!.streak).toBe(1);

    const missed = await games.answer(
      userId,
      run.runId,
      await wrongAnswerFor(before!.card!.metaId),
      1_000,
    );

    expect(missed.graded?.correct).toBe(false);
    expect(missed.graded!.points).toBe(0);
    expect(missed.run.streak).toBe(0);
  });

  // The streak used to be counted back from the answer log after the answer
  // had already been written, so the answer being scored counted towards its
  // own multiplier and every recovery was paid as if it were a run of two.
  it('does not let an answer count towards its own multiplier', async () => {
    const run = await games.start(userId, { mode: 'RUSH' });
    const missed = await games.answer(
      userId,
      run.runId,
      await wrongAnswerFor(run.card!.metaId),
      1_000,
    );

    const recovery = missed.run.card!;
    const afterMiss = await games.answer(userId, run.runId, await answerFor(recovery.metaId), 1_000);

    // Nothing is behind this answer, so it is worth at most the base, the
    // whole speed bonus and its difficulty bonus, with no multiplier on top.
    const ceiling = scoreAnswer({
      correct: true,
      responseMs: 0,
      difficulty: recovery.difficulty,
      streak: 0,
    });

    expect(afterMiss.run.streak).toBe(1);
    expect(afterMiss.graded!.points).toBeLessThanOrEqual(ceiling);
  });

  it('ends a survival run on the third wrong answer', async () => {
    let run = await games.start(userId, { mode: 'SURVIVAL' });

    for (let life = 3; life > 0; life -= 1) {
      expect(run.livesLeft).toBe(life);
      const graded = await games.answer(
        userId,
        run.runId,
        await wrongAnswerFor(run.card!.metaId),
        1_000,
      );
      run = graded.run;
    }

    expect(run.finished).toBe(true);
    expect(run.livesLeft).toBe(0);
  });

  it('picks a half-played daily challenge back up rather than spending it', async () => {
    const started = await games.start(userId, { mode: 'DAILY' });
    await games.answer(userId, started.runId, await answerFor(started.card!.metaId), 1_000);

    // Wandering off to another mode and back must not cost the attempt.
    await games.start(userId, { mode: 'RUSH' });
    const resumed = await games.start(userId, { mode: 'DAILY' });

    expect(resumed.runId).toBe(started.runId);
    expect(resumed.answered).toBe(1);
  });

  it('refuses a second daily challenge once the first is finished', async () => {
    let run = await games.start(userId, { mode: 'DAILY' });

    while (!run.finished) {
      const graded = await games.answer(
        userId,
        run.runId,
        await answerFor(run.card!.metaId),
        1_000,
      );
      run = graded.run;
    }

    await expect(games.start(userId, { mode: 'DAILY' })).rejects.toThrow();
  });

  it('records the same answer against the spaced repetition schedule', async () => {
    const run = await games.start(userId, { mode: 'RUSH' });
    const metaId = run.card!.metaId;

    await games.answer(userId, run.runId, await answerFor(metaId), 1_000);

    const card = await prisma.reviewCard.findUnique({
      where: { userId_metaId: { userId, metaId } },
    });

    expect(card?.repetitions).toBeGreaterThan(0);
  });

  it('earns experience for every answer, right or wrong', async () => {
    const before = (await progress.getProgress(userId)).xp;
    const run = await games.start(userId, { mode: 'RUSH' });

    await games.answer(userId, run.runId, await wrongAnswerFor(run.card!.metaId), 1_000);

    expect((await progress.getProgress(userId)).xp).toBeGreaterThan(before);
  });

  it('puts a finished run on the leaderboard', async () => {
    const run = await games.start(userId, { mode: 'SURVIVAL' });
    let current = run;

    // Three wrong answers end the run, which is what banks the score.
    for (let life = 0; life < 3; life += 1) {
      const graded = await games.answer(
        userId,
        current.runId,
        await wrongAnswerFor(current.card!.metaId),
        1_000,
      );
      current = graded.run;
    }

    const board = await leaderboard.getBoard('SURVIVAL', 'all', userId);

    expect(board.you).not.toBeNull();
    expect(board.you!.rank).toBeGreaterThan(0);
  });
});
