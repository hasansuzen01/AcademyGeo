import { Module } from '@nestjs/common';

import { ProgressModule } from '../progress/progress.module.js';

import { AdminDecksService } from './admin-decks.service.js';
import { AdminMetasService } from './admin-metas.service.js';
import { AdminOverviewService } from './admin-overview.service.js';
import { AdminCountriesService } from './admin-countries.service.js';
import { AdminUsersService } from './admin-users.service.js';
import { AdminController } from './admin.controller.js';
import { AuditService } from './audit.service.js';

@Module({
  // The account page shows a player's level and badges, which the progress
  // service already knows how to work out.
  imports: [ProgressModule],
  controllers: [AdminController],
  providers: [
    AdminMetasService,
    AdminDecksService,
    AdminCountriesService,
    AdminUsersService,
    AdminOverviewService,
    AuditService,
  ],
})
export class AdminModule {}
