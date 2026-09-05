import { type ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import type { RequestWithUser } from './session.guard.js';
import { SessionGuard } from './session.guard.js';

/** Everything under /api/admin sits behind this. */
@Injectable()
export class AdminGuard extends SessionGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (request.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Admins only');
    }

    return true;
  }
}
