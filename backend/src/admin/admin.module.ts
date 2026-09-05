import { Module } from '@nestjs/common';

import { AdminDecksService } from './admin-decks.service.js';
import { AdminMetasService } from './admin-metas.service.js';
import { AdminOverviewService } from './admin-overview.service.js';
import { AdminCountriesService } from './admin-countries.service.js';
import { AdminUsersService } from './admin-users.service.js';
import { AdminController } from './admin.controller.js';
import { AuditService } from './audit.service.js';

@Module({
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
