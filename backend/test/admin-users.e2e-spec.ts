import 'dotenv/config';

import { ConfigModule } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AdminModule } from '../src/admin/admin.module.js';
import { AdminUsersService } from '../src/admin/admin-users.service.js';
import { AuthModule } from '../src/auth/auth.module.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { RedisModule } from '../src/redis/redis.module.js';
import { StorageModule } from '../src/storage/storage.module.js';

/**
 * Account management against a real database. What matters here is the pair of
 * rules that stop the panel locking itself, and that suspending actually shuts
 * the account out rather than just labelling it.
 */
describe('Account management', () => {
  let moduleRef: TestingModule;
  let users: AdminUsersService;
  let prisma: PrismaService;
  let adminId: string;
  let playerId: string;

  const stamp = Date.now();

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        RedisModule,
        AuthModule,
        StorageModule,
        AdminModule,
      ],
    }).compile();
    await moduleRef.init();

    users = moduleRef.get(AdminUsersService);
    prisma = moduleRef.get(PrismaService);

    const admin = await prisma.user.create({
      data: { name: 'Test admin', email: `admin-${stamp}@example.test`, role: 'ADMIN' },
    });
    const player = await prisma.user.create({
      data: { name: 'Test player', email: `player-${stamp}@example.test` },
    });
    adminId = admin.id;
    playerId = player.id;
  });

  afterAll(async () => {
    await prisma.user
      .deleteMany({ where: { email: { endsWith: `-${stamp}@example.test` } } })
      .catch(() => undefined);
    await moduleRef.close();
  });

  it('suspends a player and signs them out of every session', async () => {
    await prisma.session.create({
      data: {
        userId: playerId,
        token: `token-${stamp}`,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    await users.setStatus(adminId, playerId, { status: 'SUSPENDED', reason: 'Testing' });

    const player = await prisma.user.findUniqueOrThrow({ where: { id: playerId } });
    const sessions = await prisma.session.count({ where: { userId: playerId } });

    expect(player.status).toBe('SUSPENDED');
    expect(player.suspendReason).toBe('Testing');
    expect(sessions).toBe(0);
  });

  it('restores a suspended player and clears the reason with it', async () => {
    await users.setStatus(adminId, playerId, { status: 'ACTIVE' });

    const player = await prisma.user.findUniqueOrThrow({ where: { id: playerId } });

    expect(player.status).toBe('ACTIVE');
    expect(player.suspendReason).toBeNull();
    expect(player.suspendedAt).toBeNull();
  });

  it('refuses to let an admin suspend their own account', async () => {
    await expect(
      users.setStatus(adminId, adminId, { status: 'SUSPENDED' }),
    ).rejects.toThrow(/your own account/i);
  });

  it('refuses to let an admin delete their own account', async () => {
    await expect(users.removeUser(adminId, adminId)).rejects.toThrow(/your own account/i);
  });

  it('renames an account without touching anything else', async () => {
    await users.updateUser(adminId, playerId, { name: 'Renamed player' });

    const player = await prisma.user.findUniqueOrThrow({ where: { id: playerId } });

    expect(player.name).toBe('Renamed player');
    expect(player.role).toBe('USER');
  });

  it('writes every change to the audit trail', async () => {
    const entries = await prisma.auditLog.findMany({
      where: { entity: 'user', entityId: playerId },
      select: { action: true },
    });

    expect(entries.map((entry) => entry.action)).toEqual(
      expect.arrayContaining(['suspend', 'restore', 'update']),
    );
  });
});
