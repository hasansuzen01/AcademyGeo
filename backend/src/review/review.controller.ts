import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator.js';
import { Throttle } from '../common/rate-limit.guard.js';
import type { AuthenticatedUser } from '../auth/session.guard.js';
import { SessionGuard } from '../auth/session.guard.js';
import { ReviewQueueQuery, SubmitAnswerDto } from './dto.js';
import { ReviewService } from './review.service.js';

@Controller('review')
@UseGuards(SessionGuard)
export class ReviewController {
  constructor(private readonly review: ReviewService) {}

  @Get('queue')
  queue(@Query() query: ReviewQueueQuery) {
    return this.review.getQueue(query);
  }

  @Throttle({ route: 'review-answer', limit: 120, windowMs: 60_000 })
  @Post('answer')
  answer(@CurrentUser() user: AuthenticatedUser, @Body() dto: SubmitAnswerDto) {
    return this.review.submitAnswer(user.id, dto);
  }
}
