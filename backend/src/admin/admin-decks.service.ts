import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from './audit.service.js';
import { DEFAULT_PAGE_SIZE } from './paging.js';
import { buildDeckOrder } from './deck-order.js';
import type { DeckOrderDto, PageQuery, UpsertDeckDto } from './dto.js';

@Injectable()
export class AdminDecksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(query: PageQuery) {
    const [items, total] = await Promise.all([
      this.prisma.deck.findMany({
        include: { _count: { select: { metas: true } } },
        orderBy: { updatedAt: 'desc' },
        take: query.take ?? DEFAULT_PAGE_SIZE,
        skip: query.skip ?? 0,
      }),
      this.prisma.deck.count(),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    const deck = await this.prisma.deck.findUnique({
      where: { id },
      include: {
        metas: {
          orderBy: { position: 'asc' },
          include: { meta: { include: { country: true } } },
        },
      },
    });
    if (!deck) throw new NotFoundException('Deck not found');

    return deck;
  }

  async create(actorId: string, dto: UpsertDeckDto) {
    await this.assertSlugFree(dto.slug);

    const deck = await this.prisma.deck.create({ data: toDeckData(dto) });

    await this.audit.record({
      actorId,
      action: 'create',
      entity: 'deck',
      entityId: deck.id,
      summary: `Created deck ${deck.slug}`,
    });

    return deck;
  }

  async update(actorId: string, id: string, dto: UpsertDeckDto) {
    const existing = await this.prisma.deck.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Deck not found');
    if (dto.slug !== existing.slug) await this.assertSlugFree(dto.slug);

    const deck = await this.prisma.deck.update({ where: { id }, data: toDeckData(dto) });

    await this.audit.record({
      actorId,
      action: 'update',
      entity: 'deck',
      entityId: deck.id,
      summary: `Edited deck ${deck.slug}`,
    });

    return deck;
  }

  /** Replaces the deck's contents with the ordered list from the editor. */
  async setMetas(actorId: string, id: string, dto: DeckOrderDto) {
    const deck = await this.prisma.deck.findUnique({ where: { id } });
    if (!deck) throw new NotFoundException('Deck not found');

    const known = await this.prisma.meta.findMany({
      where: { id: { in: dto.metaIds } },
      select: { id: true },
    });
    const entries = buildDeckOrder(dto.metaIds, new Set(known.map((meta) => meta.id)));

    await this.prisma.$transaction([
      this.prisma.deckMeta.deleteMany({ where: { deckId: id } }),
      this.prisma.deckMeta.createMany({
        data: entries.map((entry) => ({ ...entry, deckId: id })),
      }),
    ]);

    await this.audit.record({
      actorId,
      action: 'reorder',
      entity: 'deck',
      entityId: id,
      summary: `Set ${entries.length} metas on ${deck.slug}`,
    });

    return this.findOne(id);
  }

  async remove(actorId: string, id: string) {
    const deck = await this.prisma.deck.findUnique({ where: { id } });
    if (!deck) throw new NotFoundException('Deck not found');

    await this.prisma.deck.delete({ where: { id } });

    await this.audit.record({
      actorId,
      action: 'delete',
      entity: 'deck',
      entityId: id,
      summary: `Removed deck ${deck.slug}`,
    });

    return { id };
  }

  private async assertSlugFree(slug: string): Promise<void> {
    const clash = await this.prisma.deck.findUnique({ where: { slug } });
    if (clash) throw new ConflictException(`A deck with the slug "${slug}" already exists`);
  }
}

function toDeckData(dto: UpsertDeckDto) {
  return {
    slug: dto.slug,
    nameEn: dto.nameEn,
    nameTr: dto.nameTr,
    descriptionEn: dto.descriptionEn ?? '',
    descriptionTr: dto.descriptionTr ?? '',
    coverImageUrl: dto.coverImageUrl ?? null,
    coverImageKey: dto.coverImageKey ?? null,
    isPublished: dto.isPublished ?? false,
    startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
    endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
  };
}
