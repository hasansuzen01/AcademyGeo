import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { AuditService } from '../admin/audit.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { sanitiseContent } from './content.js';
import type { ContentListQuery, UpsertPageDto } from './dto.js';

/** The standing pages reached from the footer. */
@Injectable()
export class PagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** What the footer links to, in the order the admin set. */
  listForFooter(locale: string) {
    return this.prisma.page.findMany({
      where: { locale, status: 'PUBLISHED' },
      select: { slug: true, title: true, footerOrder: true },
      orderBy: [{ footerOrder: 'asc' }, { title: 'asc' }],
    });
  }

  async readPublished(locale: string, slug: string) {
    const page = await this.prisma.page.findFirst({
      where: { locale, slug, status: 'PUBLISHED' },
    });
    if (!page) throw new NotFoundException('Page not found');

    return page;
  }

  /** Published is not the same as worth indexing, so both are checked. */
  sitemapRows() {
    return this.prisma.page.findMany({
      where: { status: 'PUBLISHED', includeInSitemap: true },
      select: { locale: true, slug: true, updatedAt: true },
    });
  }

  async list(query: ContentListQuery) {
    const where: Prisma.PageWhereInput = { locale: query.locale, status: query.status };

    const [items, total] = await Promise.all([
      this.prisma.page.findMany({
        where,
        select: {
          id: true,
          locale: true,
          slug: true,
          title: true,
          status: true,
          includeInSitemap: true,
          footerOrder: true,
          updatedAt: true,
        },
        orderBy: [{ locale: 'asc' }, { footerOrder: 'asc' }],
        take: query.take ?? 50,
        skip: query.skip ?? 0,
      }),
      this.prisma.page.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');

    return page;
  }

  async create(actorId: string, dto: UpsertPageDto) {
    await this.assertSlugFree(dto.locale, dto.slug);

    const page = await this.prisma.page.create({
      data: { ...dto, content: sanitiseContent(dto.content) },
    });

    await this.audit.record({
      actorId,
      action: 'create',
      entity: 'page',
      entityId: page.id,
      summary: `Added ${page.slug} (${page.locale})`,
    });

    return page;
  }

  async update(actorId: string, id: string, dto: UpsertPageDto) {
    const existing = await this.prisma.page.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Page not found');

    if (dto.slug !== existing.slug || dto.locale !== existing.locale) {
      await this.assertSlugFree(dto.locale, dto.slug);
    }

    const page = await this.prisma.page.update({
      where: { id },
      data: { ...dto, content: sanitiseContent(dto.content) },
    });

    await this.audit.record({
      actorId,
      action: 'update',
      entity: 'page',
      entityId: page.id,
      summary: `Edited ${page.slug} (${page.locale})`,
    });

    return page;
  }

  async remove(actorId: string, id: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');

    await this.prisma.page.delete({ where: { id } });
    await this.audit.record({
      actorId,
      action: 'delete',
      entity: 'page',
      entityId: id,
      summary: `Removed ${page.slug} (${page.locale})`,
    });

    return { id };
  }

  private async assertSlugFree(locale: string, slug: string): Promise<void> {
    const clash = await this.prisma.page.findUnique({ where: { locale_slug: { locale, slug } } });
    if (clash) throw new ConflictException(`A ${locale} page already lives at "${slug}"`);
  }
}
