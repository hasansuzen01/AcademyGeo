import { Controller, Get, UseGuards } from '@nestjs/common';

import { CurrentUser } from './current-user.decorator.js';
import type { AuthenticatedUser } from './session.guard.js';
import { SessionGuard } from './session.guard.js';

@Controller('me')
@UseGuards(SessionGuard)
export class MeController {
  @Get()
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
