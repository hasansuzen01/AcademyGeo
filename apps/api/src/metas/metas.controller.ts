import { Controller, Get } from '@nestjs/common';

import { MetasService } from './metas.service.js';

@Controller('metas')
export class MetasController {
  constructor(private readonly metas: MetasService) {}

  @Get('countries')
  countries() {
    return this.metas.listCountries();
  }

  @Get('summary')
  summary() {
    return this.metas.getCatalogueSummary();
  }
}
