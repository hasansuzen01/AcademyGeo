import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { AuditService } from '../admin/audit.service.js';
import {
  measureContent,
  publishAction,
  resolvePublishedAt,
  sanitiseContent,
} from '../content/content.js';
import { CREDIT_COLUMNS } from '../metas/image-credit.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { GuideListQuery, UpsertEntryDto, UpsertTopicDto } from './dto.js';
import { guideExamples, nextEntry, summariseTopic } from './guides.js';

/** What an entry shows in a list. The body is deliberately absent. */
const ENTRY_CARD = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImageUrl: true,
  countryCode: true,
  readingTime: true,
  position: true,
} satisfies Prisma.GuideEntrySelect;

const PUBLISHED = { status: 'PUBLISHED' } as const;

/**
 * Cards fit to stand in a heading as examples: live, and showing a real
 * photograph. A seeded diagram is a stand-in for a quiz, not a field guide.
 */
const PHOTO_CARD = { isPublished: true, imageSource: 'PHOTO' } satisfies Prisma.MetaWhereInput;

/** What a heading needs from each of its example cards. */
const EXAMPLE_ROW = {
  id: true,
  slug: true,
  titleEn: true,
  titleTr: true,
  descriptionEn: true,
  descriptionTr: true,
  imageUrl: true,
  ...CREDIT_COLUMNS,
  country: { select: { code: true, nameEn: true, nameTr: true, flagEmoji: true } },
} satisfies Prisma.MetaSelect;

/** Entries in the order the author set, ties broken by title. */
const BY_POSITION: Prisma.GuideEntryOrderByWithRelationInput[] = [
  { position: 'asc' },
  { title: 'asc' },
];

/** An optional foreign key arrives as "" from a select box, not as null. */
function orNull<T extends string>(value: T | '' | null | undefined): T | null {
  return value ? value : null;
}

@Injectable()
export class GuidesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // -- Reading --------------------------------------------------------------

  /** The library index: every published heading with what is under it. */
  async listTopics(locale: string) {
    const [topics, photoCounts] = await Promise.all([
      this.prisma.guideTopic.findMany({
        where: { locale, ...PUBLISHED },
        orderBy: [{ position: 'asc' }, { title: 'asc' }],
        include: { entries: { select: { status: true, readingTime: true } } },
      }),
      this.prisma.meta.groupBy({ by: ['category'], where: PHOTO_CARD, _count: { _all: true } }),
    ]);

    const perCategory = new Map(photoCounts.map((row) => [row.category, row._count._all]));

    return topics.map(({ entries, ...topic }) => ({
      ...topic,
      ...summariseTopic(entries),
      exampleCount: topic.category ? (perCategory.get(topic.category) ?? 0) : 0,
    }));
  }

  /**
   * One heading, the entries a reader can open under it, and every photo card
   * of its clue type, country by country.
   */
  async readTopic(locale: string, slug: string) {
    const topic = await this.findReadableTopic(locale, slug);
    const rows = topic.category
      ? await this.prisma.meta.findMany({
          where: { ...PHOTO_CARD, category: topic.category },
          select: EXAMPLE_ROW,
        })
      : [];

    return { ...topic, examples: guideExamples(locale, rows) };
  }

  private async findReadableTopic(locale: string, slug: string) {
    const topic = await this.prisma.guideTopic.findFirst({
      where: { locale, slug, ...PUBLISHED },
      include: { entries: { where: PUBLISHED, select: ENTRY_CARD, orderBy: BY_POSITION } },
    });
    if (!topic) throw new NotFoundException('Guide not found');

    return topic;
  }

  /**
   * One entry, the heading it sits under, and the entry that follows it.
   *
   * The heading is checked as well as the entry: publishing an entry under a
   * heading still being written must not put the heading in public with it.
   */
  async readEntry(locale: string, topicSlug: string, entrySlug: string) {
    const { entries, ...topic } = await this.findReadableTopic(locale, topicSlug);

    const entry = await this.prisma.guideEntry.findFirst({
      where: { topicId: topic.id, slug: entrySlug, ...PUBLISHED },
      include: { country: { select: { code: true, nameEn: true, nameTr: true, flagEmoji: true } } },
    });
    if (!entry) throw new NotFoundException('Guide entry not found');

    // Best effort: a failed counter must never cost the reader the article.
    await this.prisma.guideEntry
      .update({ where: { id: entry.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => undefined);

    return { entry, topic, next: nextEntry(entries, entrySlug) };
  }

  /**
   * Published entries about one country, for its atlas page. The heading is
   * carried along so the link can be built without a second call.
   */
  listForCountry(countryCode: string) {
    return this.prisma.guideEntry.findMany({
      where: { countryCode, ...PUBLISHED, topic: PUBLISHED },
      select: {
        ...ENTRY_CARD,
        topic: { select: { locale: true, slug: true, title: true, icon: true } },
      },
      // Grouped by heading first: entries from different headings ordered by
      // their own position alone would interleave into one shuffled list.
      orderBy: [{ topic: { position: 'asc' } }, ...BY_POSITION],
    });
  }

  /** Rows for the sitemap: every readable heading, then every entry. */
  async sitemapRows() {
    const [topics, entries] = await Promise.all([
      this.prisma.guideTopic.findMany({
        where: PUBLISHED,
        select: { locale: true, slug: true, updatedAt: true },
      }),
      this.prisma.guideEntry.findMany({
        where: { ...PUBLISHED, topic: PUBLISHED },
        select: { slug: true, updatedAt: true, topic: { select: { locale: true, slug: true } } },
      }),
    ]);

    return [
      ...topics,
      ...entries.map((entry) => ({
        locale: entry.topic.locale,
        slug: entry.topic.slug,
        entrySlug: entry.slug,
        updatedAt: entry.updatedAt,
      })),
    ];
  }

  // -- Headings, from the admin panel ---------------------------------------

  async list(query: GuideListQuery) {
    const where: Prisma.GuideTopicWhereInput = {
      locale: query.locale,
      status: query.status,
      ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.guideTopic.findMany({
        where,
        orderBy: [{ locale: 'asc' }, { position: 'asc' }, { title: 'asc' }],
        include: { _count: { select: { entries: true } } },
      }),
      this.prisma.guideTopic.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    const topic = await this.prisma.guideTopic.findUnique({
      where: { id },
      include: {
        entries: {
          select: { ...ENTRY_CARD, status: true, updatedAt: true, viewCount: true },
          orderBy: BY_POSITION,
        },
      },
    });
    if (!topic) throw new NotFoundException('Guide not found');

    return topic;
  }

  async create(actorId: string, dto: UpsertTopicDto) {
    await this.assertTopicSlugFree(dto.locale, dto.slug);

    const topic = await this.prisma.guideTopic.create({
      data: { ...dto, category: orNull(dto.category) },
    });

    await this.audit.record({
      actorId,
      action: 'create',
      entity: 'guide',
      entityId: topic.id,
      summary: `Opened ${topic.slug} (${topic.locale})`,
    });

    return topic;
  }

  async update(actorId: string, id: string, dto: UpsertTopicDto) {
    const existing = await this.prisma.guideTopic.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Guide not found');

    if (dto.slug !== existing.slug || dto.locale !== existing.locale) {
      await this.assertTopicSlugFree(dto.locale, dto.slug);
    }

    const topic = await this.prisma.guideTopic.update({
      where: { id },
      data: { ...dto, category: orNull(dto.category) },
    });

    await this.audit.record({
      actorId,
      action: publishAction(existing.status, topic.status),
      entity: 'guide',
      entityId: topic.id,
      summary: `Edited ${topic.slug} (${topic.locale})`,
    });

    return topic;
  }

  /** Deleting a heading takes its entries with it, so the count is recorded. */
  async remove(actorId: string, id: string) {
    const topic = await this.prisma.guideTopic.findUnique({
      where: { id },
      include: { _count: { select: { entries: true } } },
    });
    if (!topic) throw new NotFoundException('Guide not found');

    await this.prisma.guideTopic.delete({ where: { id } });
    await this.audit.record({
      actorId,
      action: 'delete',
      entity: 'guide',
      entityId: id,
      summary: `Removed ${topic.slug} and the ${topic._count.entries} entries under it`,
    });

    return { id };
  }

  // -- Entries, from the admin panel ----------------------------------------

  async findEntry(id: string) {
    const entry = await this.prisma.guideEntry.findUnique({
      where: { id },
      include: { topic: { select: { id: true, locale: true, slug: true, title: true } } },
    });
    if (!entry) throw new NotFoundException('Guide entry not found');

    return entry;
  }

  async createEntry(actorId: string, topicId: string, dto: UpsertEntryDto) {
    const topic = await this.prisma.guideTopic.findUnique({ where: { id: topicId } });
    if (!topic) throw new NotFoundException('Guide not found');

    await this.assertEntrySlugFree(topicId, dto.slug);
    await this.assertCountryExists(dto.countryCode);

    const entry = await this.prisma.guideEntry.create({
      data: {
        ...this.prepare(dto),
        topicId,
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
      entity: 'guide-entry',
      entityId: entry.id,
      summary: `Wrote ${entry.slug} under ${topic.slug}`,
    });

    return entry;
  }

  async updateEntry(actorId: string, id: string, dto: UpsertEntryDto) {
    const existing = await this.prisma.guideEntry.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Guide entry not found');

    if (dto.slug !== existing.slug) {
      await this.assertEntrySlugFree(existing.topicId, dto.slug);
    }
    await this.assertCountryExists(dto.countryCode);


    const status = dto.status ?? existing.status;
    const entry = await this.prisma.guideEntry.update({
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
      entity: 'guide-entry',
      entityId: entry.id,
      summary: `Edited ${entry.slug}`,
    });

    return entry;
  }

  async removeEntry(actorId: string, id: string) {
    const entry = await this.prisma.guideEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Guide entry not found');

    await this.prisma.guideEntry.delete({ where: { id } });
    await this.audit.record({
      actorId,
      action: 'delete',
      entity: 'guide-entry',
      entityId: id,
      summary: `Removed ${entry.slug}`,
    });

    return { id };
  }

  /** Cleans the body and works out its length before either is stored. */
  private prepare(dto: UpsertEntryDto) {
    const content = sanitiseContent(dto.content);

    return { ...dto, content, countryCode: orNull(dto.countryCode), ...measureContent(content) };
  }

  /**
   * Refuses a country the deck does not have.
   *
   * The foreign key would refuse it too, but as a constraint violation the
   * writer never sees, so the panel would report an internal error for a
   * mistyped code rather than saying which field is wrong.
   */
  private async assertCountryExists(code: string | undefined): Promise<void> {
    if (!code) return;

    const country = await this.prisma.country.findUnique({ where: { code } });
    if (!country) throw new BadRequestException(`There is no country with the code "${code}"`);
  }

  private async assertTopicSlugFree(locale: string, slug: string): Promise<void> {
    const clash = await this.prisma.guideTopic.findUnique({
      where: { locale_slug: { locale, slug } },
    });
    if (clash) throw new ConflictException(`A ${locale} guide already lives at "${slug}"`);
  }

  private async assertEntrySlugFree(topicId: string, slug: string): Promise<void> {
    const clash = await this.prisma.guideEntry.findUnique({
      where: { topicId_slug: { topicId, slug } },
    });
    if (clash) throw new ConflictException(`This guide already has an entry at "${slug}"`);
  }
}
