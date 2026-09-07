import { Module } from '@nestjs/common';

import { AuditService } from '../admin/audit.service.js';
import { AdminGuidesController } from './admin-guides.controller.js';
import { GuidesController } from './guides.controller.js';
import { GuidesService } from './guides.service.js';

@Module({
  controllers: [GuidesController, AdminGuidesController],
  providers: [GuidesService, AuditService],
})
export class GuidesModule {}
