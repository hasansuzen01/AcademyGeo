import type { MetadataRoute } from 'next';

import { fetchAtlasCountries } from '@/lib/atlas-api';
import { SERVER_API_URL } from '@/lib/api-base';
import { fetchSiteSeo } from '@/lib/content-api';
import { type GuideSitemapRow, type SitemapRow, buildSitemap } from '@/lib/sitemap';

/**
 * sitemap.xml.
 *
 * Built per request rather than at build time: the API is not running while
 * the image is being built, so a sitemap made then would list only the static
 * addresses and no published post, and it would look perfectly healthy.
 */
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await fetchSiteSeo();
  if (!site.sitemapEnabled) return [];

  const [posts, pages, guides, countries] = await Promise.all([
    fetchRows<SitemapRow>('/api/blog/sitemap'),
    fetchRows<SitemapRow>('/api/pages/sitemap'),
    fetchRows<GuideSitemapRow>('/api/guides/sitemap'),
    fetchAtlasCountries().catch(() => []),
  ]);

  return buildSitemap({
    siteUrl: site.siteUrl,
    now: new Date(),
    posts,
    pages,
    guides,
    countryCodes: countries.map((country) => country.code),
  });
}

/** One source failing should cost its own rows, not the whole file. */
async function fetchRows<T>(path: string): Promise<T[]> {
  try {
    const response = await fetch(`${SERVER_API_URL}${path}`, { cache: 'no-store' });

    return response.ok ? ((await response.json()) as T[]) : [];
  } catch {
    return [];
  }
}
