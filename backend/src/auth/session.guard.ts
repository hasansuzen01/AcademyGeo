import {
  CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { UserRole } from '@prisma/client';
import { fromNodeHeaders } from 'better-auth/node';
import type { Request } from 'express';

import { PrismaService } from '../prisma/prisma.service.js';
import type { Auth } from './auth.js';
import { AUTH } from './auth.tokens.js';

/**
 * How stale "last seen" is allowed to get. Writing it on every request would
 * put a database write behind every page; a few minutes is precise enough to
 * answer "was this account here today".
 */
const LAST_SEEN_INTERVAL_MS = 5 * 60 * 1000;

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: UserRole;
}

export interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    @Inject(AUTH) private readonly auth: Auth,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const session = await this.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session?.user) {
      throw new UnauthorizedException('Sign in to continue');
    }

    // The role is read from the database rather than the session, so revoking
    // an admin takes effect on their next request instead of their next login.
    const user = await this.prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        status: true,
        lastSeenAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Sign in to continue');
    }

    // Read here for the same reason: a suspension takes effect on the next
    // request, without waiting for the session to expire.
    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException('This account is suspended.');
    }

    await this.touchLastSeen(user.id, user.lastSeenAt);

    request.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    };

    return true;
  }

  /** Best effort: losing a "last seen" write must not fail the request. */
  private async touchLastSeen(userId: string, lastSeenAt: Date | null): Promise<void> {
    const now = Date.now();
    if (lastSeenAt && now - lastSeenAt.getTime() < LAST_SEEN_INTERVAL_MS) return;

    await this.prisma.user
      .update({ where: { id: userId }, data: { lastSeenAt: new Date(now) } })
      .catch(() => undefined);
  }
}
