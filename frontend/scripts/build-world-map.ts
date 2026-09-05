/**
 * Turns the world into one JSON file of SVG paths.
 *
 * The atlas needs a map you can click a country on, not a live map service:
 * the borders do not move, so fetching them at runtime would buy an outage and
 * a rate limit for nothing. The shapes come from Natural Earth by way of the
 * world-atlas package, which is public domain, and the projection is applied
 * here rather than in the browser so the page ships paths and no geometry
 * library at all.
 *
 * Run with: npm run map:build --workspace frontend
 */
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { geoEqualEarth, geoPath } from 'd3-geo';
import countries from 'i18n-iso-countries';
import english from 'i18n-iso-countries/langs/en.json' with { type: 'json' };
import turkish from 'i18n-iso-countries/langs/tr.json' with { type: 'json' };
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';

import world from 'world-atlas/countries-110m.json' with { type: 'json' };

const WIDTH = 960;
const HEIGHT = 460;
/** Whole pixels at this width. Finer than that is below what a screen can
 *  show, and every extra digit is shipped to every reader. */
const PRECISION = 0;

/** Antarctica is an enormous coastline nobody can practise on. */
const SKIPPED = new Set(['AQ']);

const OUTPUT = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'lib',
  'world-map.json',
);

interface CountryShape {
  /** ISO 3166-1 alpha-2, which is what the rest of the app keys countries on. */
  code: string;
  nameEn: string;
  nameTr: string;
  d: string;
}

async function main(): Promise<void> {
  countries.registerLocale(english as Parameters<typeof countries.registerLocale>[0]);
  countries.registerLocale(turkish as Parameters<typeof countries.registerLocale>[0]);

  const topology = world as unknown as Topology;
  const collection = feature(topology, topology.objects.countries) as GeoJSON.FeatureCollection;

  const projection = geoEqualEarth().fitSize([WIDTH, HEIGHT], collection);
  const toPath = geoPath(projection).digits(PRECISION);

  const shapes: CountryShape[] = [];

  for (const country of collection.features) {
    // world-atlas identifies countries by their numeric ISO code.
    const code = countries.numericToAlpha2(String(country.id));
    const d = toPath(country);
    if (!code || !d || SKIPPED.has(code)) continue;

    const fallback = String(country.properties?.name ?? code);

    shapes.push({
      code,
      nameEn: countries.getName(code, 'en') ?? fallback,
      nameTr: countries.getName(code, 'tr') ?? fallback,
      d,
    });
  }

  shapes.sort((left, right) => left.code.localeCompare(right.code));

  await writeFile(
    OUTPUT,
    `${JSON.stringify({ width: WIDTH, height: HEIGHT, shapes }, null, 0)}\n`,
    'utf8',
  );

  console.log(`Wrote ${shapes.length} country shapes to ${OUTPUT}`);
}

await main();
