import type { MetadataRoute } from 'next';
import { SERVER_API_URL } from '@/lib/api-base';

import { fetchSiteSeo } from '@/lib/content-api';
import { type SitemapRow, buildSitemap } from '@/lib/sitemap';

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

  const [posts, pages] = await Promise.all([
    fetchRows('/api/blog/sitemap'),
    fetchRows('/api/pages/sitemap'),
  ]);

  return buildSitemap(site.siteUrl, posts, pages, new Date());
}

/** One source failing should cost its own rows, not the whole file. */
async function fetchRows(path: string): Promise<SitemapRow[]> {
  try {
    const response = await fetch(`${SERVER_API_URL}${path}`, { cache: 'no-store' });

    return response.ok ? ((await response.json()) as SitemapRow[]) : [];
  } catch {
    return [];
  }
}
