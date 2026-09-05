import { Controller, Get } from '@nestjs/common';

import { MetasService } from './metas.service.js';

/** How many card pictures the landing strip shows. */
const SHOWCASE_SIZE = 8;

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

  @Get('showcase')
  showcase() {
    return this.metas.getShowcase(SHOWCASE_SIZE);
  }
}
