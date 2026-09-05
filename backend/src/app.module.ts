import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AdminModule } from './admin/admin.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ContentModule } from './content/content.module.js';
import { HealthModule } from './health/health.module.js';
import { MeController } from './auth/me.controller.js';
import { MetasModule } from './metas/metas.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RedisModule } from './redis/redis.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { ReviewModule } from './review/review.module.js';
import { StatsModule } from './stats/stats.module.js';
import { StorageModule } from './storage/storage.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    AuthModule,
    StorageModule,
    HealthModule,
    MetasModule,
    ContentModule,
    ReviewModule,
    StatsModule,
    ProfileModule,
    AdminModule,
  ],
  controllers: [MeController],
})
export class AppModule {}
