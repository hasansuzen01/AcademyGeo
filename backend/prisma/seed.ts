import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import { measureContent, sanitiseContent } from '../src/content/content.ts';
import { artFileName } from './art-file.ts';
import { BLOG_POSTS } from './blog-posts.ts';
import { COUNTRIES, METAS } from './catalogue.ts';
import { COUNTRY_FACTS } from './country-facts.ts';
import { DECKS } from './decks.ts';
import { type CardSeed, DRAFT_CARDS } from './draft-cards.ts';
import { FOOTER_PAGES } from './footer-pages.ts';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main(): Promise<void> {
  for (const country of COUNTRIES) {
    // The written-up facts are merged in where they exist. A country without
    // them still seeds, it just has an empty reference page until someone
    // fills it in from the admin panel.
    const data = { ...country, ...COUNTRY_FACTS[country.code] };

    await prisma.country.upsert({
      where: { code: country.code },
      create: data,
      update: data,
    });
  }

  for (const meta of METAS) {
    await upsertCard(meta, `/metas/${artFileName(meta.slug)}`);
  }

  // Cards written up but still waiting for a photograph. They arrive as
  // drafts, so they stay out of practice until an admin uploads one.
  for (const card of DRAFT_CARDS) {
    await upsertCard(card, '');
  }

  for (const page of FOOTER_PAGES) {
    await prisma.page.upsert({
      where: { locale_slug: { locale: page.locale, slug: page.slug } },
      create: page,
      update: page,
    });
  }

  await seedDecks();
  await seedPosts();
  await seedSiteSeo();

  console.log(
    `Seeded ${COUNTRIES.length} countries, ${METAS.length} metas, ` +
      `${DRAFT_CARDS.length} draft cards awaiting a photograph, ${DECKS.length} collections, ` +
      `${BLOG_POSTS.length} posts and ${FOOTER_PAGES.length} footer pages`,
  );
}

/**
 * Writes one card. The slug is its stable identity, so re-seeding updates the
 * existing row instead of duplicating everyone's review history.
 *
 * The picture and whether the card is live are only set when the card is
 * first created. Both belong to whoever is running the site from then on, and
 * re-seeding must not undo an upload or take a published card back down.
 */
async function upsertCard(card: CardSeed, imageUrl: string): Promise<void> {
  const text = {
    countryCode: card.countryCode,
    category: card.category,
    titleEn: card.titleEn,
    titleTr: card.titleTr,
    descriptionEn: card.descriptionEn,
    descriptionTr: card.descriptionTr,
    difficulty: card.difficulty,
  };

  await prisma.meta.upsert({
    where: { slug: card.slug },
    create: { ...text, slug: card.slug, imageUrl, isPublished: imageUrl !== '' },
    update: text,
  });
}

/**
 * Collections are described by a rule rather than a list of slugs, so a deck
 * picks up new cards as they are added instead of quietly going stale.
 */
async function seedDecks(): Promise<void> {
  for (const seed of DECKS) {
    const metas = await prisma.meta.findMany({
      where: {
        isPublished: true,
        category: seed.rule.categories ? { in: seed.rule.categories } : undefined,
        countryCode: seed.rule.countryCodes ? { in: seed.rule.countryCodes } : undefined,
        difficulty: seed.rule.minDifficulty ? { gte: seed.rule.minDifficulty } : undefined,
      },
      select: { id: true },
      orderBy: [{ difficulty: 'asc' }, { slug: 'asc' }],
    });

    const data = {
      slug: seed.slug,
      nameEn: seed.nameEn,
      nameTr: seed.nameTr,
      descriptionEn: seed.descriptionEn,
      descriptionTr: seed.descriptionTr,
      isPublished: metas.length > 0,
    };

    const deck = await prisma.deck.upsert({
      where: { slug: seed.slug },
      create: data,
      update: data,
    });

    // The rule decides membership, so the old membership is replaced rather
    // than added to; otherwise a card that no longer matches would linger.
    await prisma.deckMeta.deleteMany({ where: { deckId: deck.id } });
    await prisma.deckMeta.createMany({
      data: metas.map((meta, position) => ({ deckId: deck.id, metaId: meta.id, position })),
    });
  }
}

/** The starting feed, written through the same cleaner the editor saves with. */
async function seedPosts(): Promise<void> {
  const now = Date.now();

  for (const seed of BLOG_POSTS) {
    const content = sanitiseContent(seed.content);
    const publishedAt = new Date(now - seed.daysAgo * 24 * 60 * 60 * 1000);

    const data = {
      locale: seed.locale,
      slug: seed.slug,
      title: seed.title,
      excerpt: seed.excerpt,
      content,
      keywords: seed.keywords,
      metaTitle: seed.metaTitle,
      metaDescription: seed.metaDescription,
      status: 'PUBLISHED' as const,
      ...measureContent(content),
    };

    await prisma.post.upsert({
      where: { locale_slug: { locale: seed.locale, slug: seed.slug } },
      // publishedAt is only written on the way in: editing a post later must
      // not move its publication date to today.
      create: { ...data, publishedAt },
      update: data,
    });
  }
}

/**
 * Fills in the search-engine settings that ship blank. Only the blank ones:
 * anything an admin has already written in the panel is left alone.
 */
async function seedSiteSeo(): Promise<void> {
  const defaults = {
    siteDescription:
      'Practise the static clues that decide a GeoGuessr round: number plates, bollards, road markings, signage, vegetation and architecture.',
    defaultMetaTitle: 'AcademyGeo — practice for reading a location',
    defaultMetaDescription:
      'Spaced repetition, scored runs and a country atlas for the clues that decide a round. Free, and open in the browser.',
    defaultKeywords:
      'geoguessr, geoguessr practice, geoguessr meta, number plates, bollards, road lines, country identification',
  };

  const existing = await prisma.siteSeo.findUnique({ where: { id: 'site' } });
  const blanks = Object.fromEntries(
    Object.entries(defaults).filter(([key]) => !existing?.[key as keyof typeof defaults]),
  );

  await prisma.siteSeo.upsert({
    where: { id: 'site' },
    create: { id: 'site', ...defaults },
    update: blanks,
  });
}

await main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
