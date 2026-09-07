import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { AuditService } from '../admin/audit.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { measureContent, publishAction, resolvePublishedAt, sanitiseContent } from './content.js';
import type { ContentListQuery, UpsertPostDto } from './dto.js';

/** Fields the reader's list needs. The body is deliberately absent. */
const CARD_FIELDS = {
  id: true,
  locale: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImageUrl: true,
  readingTime: true,
  publishedAt: true,
} satisfies Prisma.PostSelect;

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** Published posts for one language, newest first. */
  listPublished(locale: string, take = 20) {
    return this.prisma.post.findMany({
      where: { locale, status: 'PUBLISHED' },
      select: CARD_FIELDS,
      orderBy: { publishedAt: 'desc' },
      take,
    });
  }

  async readPublished(locale: string, slug: string) {
    const post = await this.prisma.post.findFirst({
      where: { locale, slug, status: 'PUBLISHED' },
      include: { author: { select: { name: true, image: true } } },
    });
    if (!post) throw new NotFoundException('Post not found');

    // Best effort: a failed counter must never cost the reader the article.
    await this.prisma.post
      .update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => undefined);

    return post;
  }

  /** Rows for the sitemap: every published post, in every language. */
  sitemapRows() {
    return this.prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: { locale: true, slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    });
  }

  /** The admin list: drafts included, newest edit first. */
  async list(query: ContentListQuery) {
    const where: Prisma.PostWhereInput = {
      locale: query.locale,
      status: query.status,
      ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        select: { ...CARD_FIELDS, status: true, updatedAt: true, viewCount: true },
        orderBy: { updatedAt: 'desc' },
        take: query.take ?? 20,
        skip: query.skip ?? 0,
      }),
      this.prisma.post.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    if (!post) throw new NotFoundException('Post not found');

    return post;
  }

  async create(actorId: string, dto: UpsertPostDto) {
    await this.assertSlugFree(dto.locale, dto.slug);

    const post = await this.prisma.post.create({
      data: {
        ...this.prepare(dto),
        authorId: actorId,
        publishedAt: resolvePublishedAt({
          existing: null,
          status: dto.status ?? 'DRAFT',
          now: new Date(),
        }),
      },
    });

    await this.audit.record({
      actorId,
      action: 'create',
      entity: 'post',
      entityId: post.id,
      summary: `Wrote ${post.slug} (${post.locale})`,
    });

    return post;
  }

  async update(actorId: string, id: string, dto: UpsertPostDto) {
    const existing = await this.prisma.post.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Post not found');

    if (dto.slug !== existing.slug || dto.locale !== existing.locale) {
      await this.assertSlugFree(dto.locale, dto.slug);
    }

    const status = dto.status ?? existing.status;
    const post = await this.prisma.post.update({
      where: { id },
      data: {
        ...this.prepare(dto),
        publishedAt: resolvePublishedAt({
          existing: existing.publishedAt,
          status,
          now: new Date(),
        }),
      },
    });

    await this.audit.record({
      actorId,
      action: publishAction(existing.status, status),
      entity: 'post',
      entityId: post.id,
      summary: `Edited ${post.slug} (${post.locale})`,
    });

    return post;
  }

  async remove(actorId: string, id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    await this.prisma.post.delete({ where: { id } });
    await this.audit.record({
      actorId,
      action: 'delete',
      entity: 'post',
      entityId: id,
      summary: `Removed ${post.slug} (${post.locale})`,
    });

    return { id };
  }

  /** Cleans the body and works out its length before either is stored. */
  private prepare(dto: UpsertPostDto) {
    const content = sanitiseContent(dto.content);

    return { ...dto, content, ...measureContent(content) };
  }

  private async assertSlugFree(locale: string, slug: string): Promise<void> {
    const clash = await this.prisma.post.findUnique({ where: { locale_slug: { locale, slug } } });
    if (clash) throw new ConflictException(`A ${locale} post already lives at "${slug}"`);
  }
}
