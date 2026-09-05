import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service.js';
import { R2Service } from '../storage/r2.service.js';
import { AuditService } from './audit.service.js';
import { DEFAULT_PAGE_SIZE } from './paging.js';
import { publishBlocker } from './publishable.js';
import type { MetaListQuery, UpsertMetaDto } from './dto.js';

@Injectable()
export class AdminMetasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly storage: R2Service,
  ) {}

  async list(query: MetaListQuery) {
    const where: Prisma.MetaWhereInput = {
      category: query.category,
      countryCode: query.countryCode,
      isPublished: query.isPublished,
      imageSource: query.imageSource,
      ...(query.hasImage === undefined ? {} : { imageUrl: query.hasImage ? { not: '' } : '' }),
      ...(query.search
        ? {
            OR: [
              { slug: { contains: query.search, mode: 'insensitive' } },
              { titleEn: { contains: query.search, mode: 'insensitive' } },
              { titleTr: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.meta.findMany({
        where,
        include: { country: true, _count: { select: { logs: true } } },
        orderBy: { updatedAt: 'desc' },
        take: query.take ?? DEFAULT_PAGE_SIZE,
        skip: query.skip ?? 0,
      }),
      this.prisma.meta.count({ where }),
    ]);

    return { items, total };
  }

  /** One meta with the numbers an editor needs to judge whether it works. */
  async findOne(id: string) {
    const meta = await this.prisma.meta.findUnique({
      where: { id },
      include: { country: true, createdBy: { select: { id: true, name: true, email: true } } },
    });
    if (!meta) throw new NotFoundException('Meta not found');

    const [answers, wrongGuesses] = await Promise.all([
      this.prisma.reviewLog.groupBy({
        by: ['correct'],
        where: { metaId: id },
        _count: { _all: true },
      }),
      this.prisma.reviewLog.groupBy({
        by: ['guessedCountryCode'],
        where: { metaId: id, correct: false },
        _count: { _all: true },
        orderBy: { _count: { guessedCountryCode: 'desc' } },
        take: 5,
      }),
    ]);

    const correct = answers.find((row) => row.correct)?._count._all ?? 0;
    const total = answers.reduce((sum, row) => sum + row._count._all, 0);

    return {
      ...meta,
      stats: {
        totalAnswers: total,
        correctAnswers: correct,
        winRate: total === 0 ? null : Math.round((correct / total) * 100),
        topWrongGuesses: wrongGuesses.map((row) => ({
          countryCode: row.guessedCountryCode,
          count: row._count._all,
        })),
      },
    };
  }

  async create(actorId: string, dto: UpsertMetaDto) {
    await this.assertSlugFree(dto.slug);
    this.assertPublishable(dto);

    const meta = await this.prisma.meta.create({
      data: { ...dto, createdById: actorId },
      include: { country: true },
    });

    await this.audit.record({
      actorId,
      action: 'create',
      entity: 'meta',
      entityId: meta.id,
      summary: `Added ${meta.slug} (${meta.countryCode})`,
    });

    return meta;
  }

  async update(actorId: string, id: string, dto: UpsertMetaDto) {
    const existing = await this.prisma.meta.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Meta not found');
    if (dto.slug !== existing.slug) await this.assertSlugFree(dto.slug);
    this.assertPublishable(dto);

    const meta = await this.prisma.meta.update({
      where: { id },
      data: dto,
      include: { country: true },
    });

    // A replaced upload leaves an orphan in the bucket otherwise.
    if (existing.imageKey && existing.imageKey !== meta.imageKey) {
      await this.discardUpload(existing.imageKey);
    }

    await this.audit.record({
      actorId,
      action: 'update',
      entity: 'meta',
      entityId: meta.id,
      summary: `Edited ${meta.slug}`,
    });

    return meta;
  }

  async remove(actorId: string, id: string) {
    const meta = await this.prisma.meta.findUnique({ where: { id } });
    if (!meta) throw new NotFoundException('Meta not found');

    await this.prisma.meta.delete({ where: { id } });
    if (meta.imageKey) await this.discardUpload(meta.imageKey);

    await this.audit.record({
      actorId,
      action: 'delete',
      entity: 'meta',
      entityId: id,
      summary: `Removed ${meta.slug}`,
    });

    return { id };
  }

  private assertPublishable(dto: UpsertMetaDto): void {
    if (publishBlocker(dto) === 'no-picture') {
      throw new BadRequestException(
        'Upload a picture before publishing this card. Save it as a draft until then.',
      );
    }
  }

  private async assertSlugFree(slug: string): Promise<void> {
    const clash = await this.prisma.meta.findUnique({ where: { slug } });
    if (clash) throw new ConflictException(`A meta with the slug "${slug}" already exists`);
  }

  private async discardUpload(key: string): Promise<void> {
    if (!this.storage.isConfigured) return;
    await this.storage.remove(key).catch(() => undefined);
  }
}
