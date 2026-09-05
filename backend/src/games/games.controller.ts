import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/session.guard.js';
import { SessionGuard } from '../auth/session.guard.js';
import { GlobalBoardQuery, LeaderboardQuery, RunAnswerDto, StartRunDto } from './dto.js';
import { GamesService } from './games.service.js';
import { LeaderboardService } from './leaderboard.service.js';

const HISTORY_SIZE = 20;
/** How many players a page of the site-wide ranking holds. */
const BOARD_PAGE_SIZE = 25;

@Controller('games')
@UseGuards(SessionGuard)
export class GamesController {
  constructor(
    private readonly games: GamesService,
    private readonly leaderboard: LeaderboardService,
  ) {}

  @Post('start')
  start(@CurrentUser() user: AuthenticatedUser, @Body() dto: StartRunDto) {
    return this.games.start(user.id, dto);
  }

  @Post('answer')
  answer(@CurrentUser() user: AuthenticatedUser, @Body() dto: RunAnswerDto) {
    return this.games.answer(user.id, dto.runId, dto.guessedCountryCode, dto.responseMs);
  }

  @Get('active')
  active(@CurrentUser() user: AuthenticatedUser) {
    return this.games.active(user.id);
  }

  @Get('history')
  history(@CurrentUser() user: AuthenticatedUser) {
    return this.games.history(user.id, HISTORY_SIZE);
  }

  @Get('daily')
  daily(@CurrentUser() user: AuthenticatedUser) {
    return this.games.dailyStatus(user.id);
  }

  @Get('leaderboard')
  board(@CurrentUser() user: AuthenticatedUser, @Query() query: LeaderboardQuery) {
    return this.leaderboard.getBoard(query.mode, query.window ?? 'all', user.id);
  }

  @Get('ranking')
  ranking(@CurrentUser() user: AuthenticatedUser, @Query() query: GlobalBoardQuery) {
    return this.leaderboard.getGlobalBoard(user.id, query.take ?? BOARD_PAGE_SIZE, query.skip ?? 0);
  }
}
