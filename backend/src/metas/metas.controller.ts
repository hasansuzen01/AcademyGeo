import { Controller, Get } from '@nestjs/common';

import { MetasService } from './metas.service.js';

/** How many card pictures the landing strip shows. */
const SHOWCASE_SIZE = 8;

/** How many cards the live demo on the landing page cycles through. */
const DEMO_SIZE = 3;

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

  @Get('demo')
  demo() {
    return this.metas.getDemoCards(DEMO_SIZE);
  }
}
