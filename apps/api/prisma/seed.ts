import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import { COUNTRIES, METAS } from './catalogue.ts';
import { FOOTER_PAGES } from './footer-pages.ts';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main(): Promise<void> {
  for (const country of COUNTRIES) {
    await prisma.country.upsert({
      where: { code: country.code },
      create: country,
      update: country,
    });
  }

  for (const meta of METAS) {
    const data = {
      slug: meta.slug,
      countryCode: meta.countryCode,
      category: meta.category,
      titleEn: meta.titleEn,
      titleTr: meta.titleTr,
      descriptionEn: meta.descriptionEn,
      descriptionTr: meta.descriptionTr,
      difficulty: meta.difficulty,
      imageUrl: `/metas/${meta.slug}.svg`,
    };

    // The slug is the stable identity of a card, so re-seeding updates the
    // existing row instead of duplicating everyone's review history.
    await prisma.meta.upsert({
      where: { slug: meta.slug },
      create: data,
      update: data,
    });
  }

  for (const page of FOOTER_PAGES) {
    await prisma.page.upsert({
      where: { locale_slug: { locale: page.locale, slug: page.slug } },
      create: page,
      update: page,
    });
  }

  console.log(
    `Seeded ${COUNTRIES.length} countries, ${METAS.length} metas and ${FOOTER_PAGES.length} footer pages`,
  );
}

await main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
