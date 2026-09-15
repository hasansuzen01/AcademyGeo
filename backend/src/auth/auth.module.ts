import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service.js';
import { R2Service } from '../storage/r2.service.js';
import { type Auth, createAuth } from './auth.js';
import { AUTH } from './auth.tokens.js';
import { AdminGuard } from './admin.guard.js';
import { SessionGuard } from './session.guard.js';

@Global()
@Module({
  providers: [
    {
      provide: AUTH,
      inject: [PrismaService, ConfigService, R2Service],
      useFactory: (prisma: PrismaService, config: ConfigService, storage: R2Service): Auth =>
        createAuth(prisma, config, storage),
    },
    SessionGuard,
    AdminGuard,
  ],
  exports: [AUTH, SessionGuard, AdminGuard],
})
export class AuthModule {}
