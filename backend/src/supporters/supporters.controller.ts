import { Controller, Get } from '@nestjs/common';

import { SupportersService } from './supporters.service.js';

/** The people who bought the site a coffee and chose to be shown. */
@Controller('supporters')
export class SupportersController {
  constructor(private readonly supporters: SupportersService) {}

  @Get()
  list() {
    return this.supporters.list();
  }
}
