import { Controller, Get, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/session.guard.js';
import { SessionGuard } from '../auth/session.guard.js';
import { ProgressService } from './progress.service.js';

@Controller('progress')
@UseGuards(SessionGuard)
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get()
  get(@CurrentUser() user: AuthenticatedUser) {
    return this.progress.getProgress(user.id);
  }
}
