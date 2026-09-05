import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, UserRole, UserStatus } from '@prisma/client';

import { toUtcDay } from '../common/utc-day.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { achievementProgress } from '../progress/achievements.js';
import { describeLevel } from '../progress/levels.js';
import { ProgressService } from '../progress/progress.service.js';
import { calculateStreak } from '../stats/streak.js';
import { type AccountAction, accountActionBlocker } from './account-actions.js';
import { AuditService } from './audit.service.js';
import type { SetStatusDto, UpdateUserDto, UserListQuery } from './dto.js';
import { DEFAULT_PAGE_SIZE } from './paging.js';

/** How many recent runs and problem countries a profile shows. */
const DETAIL_ROWS = 10;

const LIST_FIELDS = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  status: true,
  xp: true,
  lastSeenAt: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

/** Accounts: who plays, who is allowed to edit the deck, and who is shut out. */
@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly progress: ProgressService,
  ) {}

  async listUsers(query: UserListQuery) {
    const where: Prisma.UserWhereInput = {
      role: query.role,
      status: query.status,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          ...LIST_FIELDS,
          _count: { select: { reviewLogs: true, reviewCards: true, gameRuns: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: query.take ?? DEFAULT_PAGE_SIZE,
        skip: query.skip ?? 0,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((user) => ({ ...user, level: describeLevel(user.xp).level })),
      total,
    };
  }

  /**
   * One account in full: what they have built up, where they keep going wrong,
   * and what they have been doing lately. Enough to answer "should this account
   * be suspended" without leaving the page.
   */
  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...LIST_FIELDS,
        suspendedAt: true,
        suspendReason: true,
        _count: { select: { reviewCards: true, gameRuns: true, sessions: true } },
      },
    });
    if (!user) throw new NotFoundException('Account not found');

    const [totals, practiceDays, weakest, runs, progress, accounts] = await Promise.all([
      this.prisma.reviewLog.groupBy({
        by: ['correct'],
        where: { userId: id },
        _count: { _all: true },
      }),
      this.prisma.dailyActivity.findMany({
        where: { userId: id, reviews: { gt: 0 } },
        select: { day: true },
        orderBy: { day: 'desc' },
      }),
      this.prisma.$queryRaw<Array<{ countryCode: string; misses: number; total: number }>>`
          SELECT m."countryCode" AS "countryCode",
                 COUNT(*) FILTER (WHERE NOT l.correct)::int AS misses,
                 COUNT(*)::int AS total
          FROM "ReviewLog" l
          JOIN "Meta" m ON m.id = l."metaId"
          WHERE l."userId" = ${id}
          GROUP BY 1
          HAVING COUNT(*) FILTER (WHERE NOT l.correct) > 0
          ORDER BY misses DESC
          LIMIT ${DETAIL_ROWS}
        `,
      this.prisma.gameRun.findMany({
        where: { userId: id, finishedAt: { not: null } },
        orderBy: { finishedAt: 'desc' },
        take: DETAIL_ROWS,
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
      }),
      this.progress.snapshot(id),
      this.prisma.account.findMany({
        where: { userId: id },
        select: { providerId: true, createdAt: true },
      }),
    ]);

    const held = await this.prisma.userAchievement.findMany({
      where: { userId: id },
      select: { code: true },
    });

    const correct = totals.find((row) => row.correct)?._count._all ?? 0;
    const answers = totals.reduce((sum, row) => sum + row._count._all, 0);

    return {
      ...user,
      level: describeLevel(user.xp),
      stats: {
        answers,
        correct,
        winRate: answers === 0 ? null : Math.round((correct / answers) * 100),
        streak: calculateStreak(
          practiceDays.map((entry) => toUtcDay(entry.day)),
          new Date(),
        ),
        daysPractised: practiceDays.length,
        trackedMetas: user._count.reviewCards,
        runs: user._count.gameRuns,
        openSessions: user._count.sessions,
      },
      weakestCountries: weakest.map((row) => ({
        countryCode: row.countryCode,
        misses: row.misses,
        winRate: Math.round(((row.total - row.misses) / row.total) * 100),
      })),
      recentRuns: runs,
      achievements: achievementProgress(
        progress,
        held.map((entry) => entry.code),
      ),
      signInMethods: accounts,
    };
  }

  /** Renames an account. The picture and the email belong to the provider. */
  async updateUser(actorId: string, userId: string, dto: UpdateUserDto) {
    await this.findOrFail(userId);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name },
      select: LIST_FIELDS,
    });

    await this.audit.record({
      actorId,
      action: 'update',
      entity: 'user',
      entityId: userId,
      summary: `Renamed ${user.email} to ${user.name}`,
    });

    return user;
  }

  async setRole(actorId: string, userId: string, role: UserRole) {
    const target = await this.findOrFail(userId);

    if (target.role === 'ADMIN' && role !== 'ADMIN') {
      await this.assertAllowed('demote', actorId, target);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: LIST_FIELDS,
    });

    await this.audit.record({
      actorId,
      action: role === 'ADMIN' ? 'grant' : 'revoke',
      entity: 'user',
      entityId: userId,
      summary: `${user.email} is now ${role.toLowerCase()}`,
    });

    return user;
  }

  /**
   * Suspending shuts the account out on its next request and takes it off the
   * leaderboards. Its history is kept, so lifting the suspension restores
   * everything the player had.
   */
  async setStatus(actorId: string, userId: string, dto: SetStatusDto) {
    const target = await this.findOrFail(userId);
    const suspending = dto.status === 'SUSPENDED';

    await this.assertAllowed(suspending ? 'suspend' : 'restore', actorId, target);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: dto.status,
        suspendedAt: suspending ? new Date() : null,
        suspendReason: suspending ? (dto.reason ?? null) : null,
      },
      select: LIST_FIELDS,
    });

    // A suspended account keeps its cookie until the session expires, so the
    // open sessions go with the suspension rather than after it.
    if (suspending) await this.prisma.session.deleteMany({ where: { userId } });

    await this.audit.record({
      actorId,
      action: suspending ? 'suspend' : 'restore',
      entity: 'user',
      entityId: userId,
      summary: suspending
        ? `Suspended ${user.email}${dto.reason ? `: ${dto.reason}` : ''}`
        : `Restored ${user.email}`,
    });

    return user;
  }

  /** Signs the account out everywhere without changing anything else. */
  async revokeSessions(actorId: string, userId: string) {
    const target = await this.findOrFail(userId);

    const { count } = await this.prisma.session.deleteMany({ where: { userId } });

    await this.audit.record({
      actorId,
      action: 'revoke',
      entity: 'user',
      entityId: userId,
      summary: `Signed ${target.email} out of ${count} session${count === 1 ? '' : 's'}`,
    });

    return { revoked: count };
  }

  /**
   * Deletes the account and everything belonging to it: the review history,
   * the runs, the badges. Suspending is the reversible option; this is not.
   */
  async removeUser(actorId: string, userId: string) {
    const target = await this.findOrFail(userId);
    await this.assertAllowed('delete', actorId, target);

    await this.prisma.user.delete({ where: { id: userId } });

    await this.audit.record({
      actorId,
      action: 'delete',
      entity: 'user',
      entityId: userId,
      summary: `Deleted the account ${target.email}`,
    });

    return { id: userId };
  }

  private async findOrFail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, status: true },
    });
    if (!user) throw new NotFoundException('Account not found');

    return user;
  }

  private async assertAllowed(
    action: AccountAction,
    actorId: string,
    target: { id: string; role: UserRole; status: UserStatus },
  ): Promise<void> {
    const adminCount = await this.prisma.user.count({
      where: { role: 'ADMIN', status: 'ACTIVE' },
    });

    const blocker = accountActionBlocker(action, target, { actorId, adminCount });
    if (!blocker) return;

    throw new BadRequestException(
      blocker === 'self'
        ? 'You cannot do that to your own account.'
        : 'This is the only admin left. Promote someone else first.',
    );
  }
}
