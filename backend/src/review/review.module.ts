import { Module } from '@nestjs/common';

import { AnswersService } from './answers.service.js';
import { PublicReviewController, ReviewController } from './review.controller.js';
import { ReviewService } from './review.service.js';

@Module({
  controllers: [PublicReviewController, ReviewController],
  providers: [AnswersService, ReviewService],
  // The scored game modes grade their answers through the same service, so a
  // run in any mode still feeds the spaced-repetition schedule.
  exports: [AnswersService],
})
export class ReviewModule {}
