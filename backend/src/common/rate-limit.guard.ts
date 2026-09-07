import {
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
  applyDecorators,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { RedisService } from '../redis/redis.service.js';
import { windowKey } from './rate-limit.js';

export interface RateLimit {
  /** Names the counter, so two limited routes never share one. */
  route: string;
  limit: number;
  windowMs: number;
}

const RATE_LIMIT = 'rate-limit';

/**
 * Caps how often one caller may hit a route.
 *
 * Applied by hand to the few routes where a flood is expensive rather than
 * globally: signing an upload, answering a card, and the sign-in handshake.
 */
export function Throttle(limit: RateLimit) {
  return applyDecorators(SetMetadata(RATE_LIMIT, limit), UseGuards(RateLimitGuard));
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limit = this.reflector.getAllAndOverride<RateLimit | undefined>(RATE_LIMIT, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!limit) return true;

    const request = context.switchToHttp().getRequest<Request>();
    // Signed in, the account is the caller; otherwise the address. Express is
    // told to trust the proxy, so this is the visitor rather than Traefik.
    const caller = (request as { user?: { id?: string } }).user?.id ?? request.ip ?? 'unknown';

    const hits = await this.redis.countInWindow(
      windowKey(limit.route, caller, Date.now(), limit.windowMs),
      Math.ceil(limit.windowMs / 1000),
    );

    if (hits > limit.limit) {
      throw new HttpException('Too many requests. Slow down.', HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}
