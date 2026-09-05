import { Module } from '@nestjs/common';

import { ProgressController } from './progress.controller.js';
import { ProgressService } from './progress.service.js';

@Module({
  controllers: [ProgressController],
  providers: [ProgressService],
  // Scored runs award experience and check the badges when they finish.
  exports: [ProgressService],
})
export class ProgressModule {}
