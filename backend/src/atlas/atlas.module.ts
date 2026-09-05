import { Module } from '@nestjs/common';

import { AtlasController } from './atlas.controller.js';
import { AtlasService } from './atlas.service.js';

@Module({
  controllers: [AtlasController],
  providers: [AtlasService],
})
export class AtlasModule {}
