import { Module } from '@nestjs/common';

import { SupportersController } from './supporters.controller.js';
import { SupportersService } from './supporters.service.js';

@Module({
  controllers: [SupportersController],
  providers: [SupportersService],
})
export class SupportersModule {}
