import {
  CanActivate,
  type ExecutionContext,
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
      select: { id: true, email: true, name: true, image: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Sign in to continue');
    }

    request.user = user;

    return true;
  }
}
