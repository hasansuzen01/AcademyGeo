import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator.js';
import { Throttle } from '../common/rate-limit.guard.js';
import type { AuthenticatedUser } from '../auth/session.guard.js';
import { SessionGuard } from '../auth/session.guard.js';
import { CheckAnswerDto, ReviewQueueQuery, SubmitAnswerDto } from './dto.js';
import { ReviewService } from './review.service.js';

/**
 * Practice for anyone, signed in or not: deal a session and grade a guess.
 *
 * A visitor arriving from a link sees a card before being asked for an
 * account. Nothing here is written down; the address is the caller the
 * limits count against.
 */
@Controller('review')
export class PublicReviewController {
  constructor(private readonly review: ReviewService) {}

  @Throttle({ route: 'review-queue', limit: 60, windowMs: 60_000 })
  @Get('queue')
  queue(@Query() query: ReviewQueueQuery) {
    return this.review.getQueue(query);
  }

  @Throttle({ route: 'review-check', limit: 120, windowMs: 60_000 })
  @Post('check')
  check(@Body() dto: CheckAnswerDto) {
    return this.review.checkAnswer(dto);
  }
}

/** A signed-in player's answer, graded and remembered. */
@Controller('review')
@UseGuards(SessionGuard)
export class ReviewController {
  constructor(private readonly review: ReviewService) {}

  @Throttle({ route: 'review-answer', limit: 120, windowMs: 60_000 })
  @Post('answer')
  answer(@CurrentUser() user: AuthenticatedUser, @Body() dto: SubmitAnswerDto) {
    return this.review.submitAnswer(user.id, dto);
  }
}
