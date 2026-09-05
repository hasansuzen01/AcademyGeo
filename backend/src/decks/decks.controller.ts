import { Controller, Get } from '@nestjs/common';

import { DecksService } from './decks.service.js';

/** Open to everyone: a collection is something to browse before signing up. */
@Controller('decks')
export class DecksController {
  constructor(private readonly decks: DecksService) {}

  @Get()
  list() {
    return this.decks.list();
  }
}
