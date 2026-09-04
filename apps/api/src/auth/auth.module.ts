import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service.js';
import { type Auth, createAuth } from './auth.js';
import { AUTH } from './auth.tokens.js';
import { AdminGuard } from './admin.guard.js';
import { SessionGuard } from './session.guard.js';

@Global()
@Module({
  providers: [
    {
      provide: AUTH,
      inject: [PrismaService, ConfigService],
      useFactory: (prisma: PrismaService, config: ConfigService): Auth =>
        createAuth(prisma, config),
    },
    SessionGuard,
    AdminGuard,
  ],
  exports: [AUTH, SessionGuard, AdminGuard],
})
export class AuthModule {}
