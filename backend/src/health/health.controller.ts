import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Liveness. Answers as long as the process is up.
   *
   * Deliberately touches nothing: a platform that restarts the API because
   * Postgres blinked turns a brief outage into a long one.
   */
  @Get()
  check() {
    return { status: 'ok', uptime: Math.round(process.uptime()) };
  }

  /**
   * Readiness. Answers only when the database will actually serve a request,
   * so a deploy is not switched over to a container that cannot work yet.
   */
  @Get('ready')
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new HttpException(
        { status: 'unavailable', database: 'down' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return { status: 'ok', database: 'up' };
  }
}
