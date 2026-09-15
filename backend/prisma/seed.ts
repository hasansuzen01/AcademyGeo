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
import { GUIDE_TOPICS } from './guide-topics.ts';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main(): Promise<void> {
  for (const country of COUNTRIES) {
    // The written-up facts are merged in where they exist. A country without
    // them still seeds, it just has an empty reference page until someone
    // fills it in from the admin panel.
    const data = { ...country, ...COUNTRY_FACTS[country.code] };

    // Created once and then left alone: the seed runs on every deploy, and a
    // fact corrected in /admin/countries must not revert on the next restart.
    await prisma.country.upsert({
      where: { code: country.code },
      create: data,
      update: {},
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

  // Seeded once and then left alone. Re-seeding runs on every deploy, and an
  // admin who rewrote the about page should not find their words replaced by
  // the shipped ones the next time the container restarts.
  for (const page of FOOTER_PAGES) {
    await prisma.page.upsert({
      where: { locale_slug: { locale: page.locale, slug: page.slug } },
      create: page,
      update: {},
    });
  }

  await seedGuideTopics();
  await seedDecks();
  await seedPosts();
  await seedSiteSeo();

  console.log(
    `Seeded ${COUNTRIES.length} countries, ${METAS.length} metas, ` +
      `${DRAFT_CARDS.length} draft cards awaiting a photograph, ${DECKS.length} collections, ` +
      `${BLOG_POSTS.length} posts, ${FOOTER_PAGES.length} footer pages ` +
      `and ${GUIDE_TOPICS.length} guide headings`,
  );
}

/**
 * Creates one card if its slug is new. The slug is its stable identity, so
 * re-seeding never duplicates a card or anyone's review history.
 *
 * Nothing on an existing card is written: its text, country, difficulty,
 * picture and whether it is live all belong to whoever runs the site once it
 * exists, and a redeploy must not undo an edit made in /admin/metas. A
 * correction to a card already live is made in the panel, not here.
 */
async function upsertCard(card: CardSeed, imageUrl: string): Promise<void> {
  await prisma.meta.upsert({
    where: { slug: card.slug },
    create: {
      slug: card.slug,
      countryCode: card.countryCode,
      category: card.category,
      titleEn: card.titleEn,
      titleTr: card.titleTr,
      descriptionEn: card.descriptionEn,
      descriptionTr: card.descriptionTr,
      difficulty: card.difficulty,
      imageUrl,
      isPublished: imageUrl !== '',
    },
    update: {},
  });
}

/**
 * Collections are described by a rule rather than a list of slugs, and the
 * rule fills a deck the first time it is created.
 *
 * An existing deck is skipped entirely. Its name, description, whether it is
 * live and which cards it holds can all be edited in /admin/decks, and a
 * redeploy must not replace any of that with the shipped version.
 */
async function seedDecks(): Promise<void> {
  for (const seed of DECKS) {
    const exists = await prisma.deck.findUnique({
      where: { slug: seed.slug },
      select: { id: true },
    });
    if (exists) continue;

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

    await prisma.deck.create({
      data: {
        slug: seed.slug,
        nameEn: seed.nameEn,
        nameTr: seed.nameTr,
        descriptionEn: seed.descriptionEn,
        descriptionTr: seed.descriptionTr,
        isPublished: metas.length > 0,
        metas: {
          create: metas.map((meta, position) => ({ metaId: meta.id, position })),
        },
      },
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
      create: { ...data, publishedAt },
      // Nothing on an existing post is touched. Re-seeding runs on every
      // deploy, and a post an admin has edited belongs to them from then on.
      update: {},
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

/**
 * The headings the guide library opens with.
 *
 * Created once and never updated: what is written under a heading, and the
 * wording of the heading itself, belongs to whoever writes it in the panel.
 * They arrive as drafts, so nothing is public until someone says so.
 */
async function seedGuideTopics(): Promise<void> {
  for (const topic of GUIDE_TOPICS) {
    await prisma.guideTopic.upsert({
      where: { locale_slug: { locale: topic.locale, slug: topic.slug } },
      create: topic,
      update: {},
    });
  }
}
