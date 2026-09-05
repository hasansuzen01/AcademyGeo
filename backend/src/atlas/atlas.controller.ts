import { Controller, Get, Param } from '@nestjs/common';

import { AtlasService } from './atlas.service.js';

/**
 * Open to everyone, signed in or not. The clue pictures are the reference a
 * player studies from, and a study guide behind a login is no use to the
 * person deciding whether to sign up.
 */
@Controller('atlas')
export class AtlasController {
  constructor(private readonly atlas: AtlasService) {}

  @Get('countries')
  countries() {
    return this.atlas.listCountries();
  }

  @Get('countries/:code')
  country(@Param('code') code: string) {
    return this.atlas.getCountry(code);
  }
}
