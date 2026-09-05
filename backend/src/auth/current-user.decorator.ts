import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { AuthenticatedUser, RequestWithUser } from './session.guard.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      throw new Error('CurrentUser used on a route that is not behind SessionGuard');
    }
    return request.user;
  },
);
