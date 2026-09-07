import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

export interface AuditEntry {
  actorId: string;
  action:
    | 'create'
    | 'update'
    | 'delete'
    | 'publish'
    | 'unpublish'
    | 'reorder'
    | 'grant'
    | 'revoke'
    | 'suspend'
    | 'restore';
  entity: 'meta' | 'country' | 'deck' | 'user' | 'post' | 'page' | 'seo' | 'guide' | 'guide-entry';
  entityId: string;
  summary: string;
}

/**
 * Records who changed what. Failures here are logged and swallowed: losing an
 * audit line must not roll back the edit an admin just made.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({ data: entry });
    } catch (error) {
      this.logger.warn(`Could not write audit entry: ${String(error)}`);
    }
  }

  list(options: { take: number; skip: number }) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { id: true, name: true, email: true } } },
      take: options.take,
      skip: options.skip,
    });
  }

  count() {
    return this.prisma.auditLog.count();
  }
}
