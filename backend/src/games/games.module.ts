import { Module } from '@nestjs/common';

import { ProgressModule } from '../progress/progress.module.js';
import { ReviewModule } from '../review/review.module.js';
import { GamesController } from './games.controller.js';
import { GamesService } from './games.service.js';
import { LeaderboardService } from './leaderboard.service.js';

@Module({
  imports: [ReviewModule, ProgressModule],
  controllers: [GamesController],
  providers: [GamesService, LeaderboardService],
})
export class GamesModule {}
