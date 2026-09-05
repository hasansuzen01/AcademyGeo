import { Controller, Get, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/session.guard.js';
import { SessionGuard } from '../auth/session.guard.js';
import { StatsService } from './stats.service.js';

@Controller('stats')
@UseGuards(SessionGuard)
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('dashboard')
  dashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.stats.getDashboard(user.id);
  }
}
