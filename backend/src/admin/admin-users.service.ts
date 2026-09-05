import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from './audit.service.js';
import type { UserListQuery } from './dto.js';
import { DEFAULT_PAGE_SIZE } from './paging.js';

/** Accounts and who is allowed to edit the deck. */
@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listUsers(query: UserListQuery) {
    const where: Prisma.UserWhereInput = {
      role: query.role,
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
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          _count: { select: { reviewLogs: true, reviewCards: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: query.take ?? DEFAULT_PAGE_SIZE,
        skip: query.skip ?? 0,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async setRole(actorId: string, userId: string, role: UserRole) {
    const target = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!target) throw new NotFoundException('Account not found');

    // Locking the last admin out would leave nobody able to restore access.
    if (target.role === 'ADMIN' && role !== 'ADMIN') {
      const admins = await this.prisma.user.count({ where: { role: 'ADMIN' } });
      if (admins <= 1) {
        throw new BadRequestException('This is the only admin left. Promote someone else first.');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, image: true, role: true, createdAt: true },
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
}
